## Introduction

- AWS SSM Chaos By Tag contains chaos to disrupt the state of infra resources. The experiment can induce chaos on AWS EC2 instance using Amazon SSM Run Command This is carried out by using SSM Docs that defines the actions performed by Systems Manager on your managed instances (having SSM agent installed) which let you perform chaos experiments on the instances.
- It causes chaos (like stress, network, disk or IO) on AWS EC2 instances with given instance Tag using SSM docs for a certain chaos duration.
- For the default execution the experiment uses SSM docs for stress-chaos while you can add your own SSM docs using configMap (.spec.definition.configMaps) in ChaosExperiment CR.
- It tests deployment sanity (replica availability & uninterrupted service) and recovery workflows of the target application pod(if provided).

!!! tip "Scenario: AWS SSM Chaos"    
    ![AWS SSM Chaos By Tag](../../images/ssm-chaos.png)

## Uses

??? info "View the uses of the experiment" 
    coming soon

## Prerequisites

??? info "Verify the prerequisites" 
    - Ensure that Kubernetes Version > 1.16 
    -  Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a href="https://v1-docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a>
    -  Ensure that the <code>aws-ssm-chaos-by-tag</code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a href="https://hub.litmuschaos.io/api/chaos/master?file=faults/aws/aws-ssm-chaos-by-tag/fault.yaml">here</a>
    - Ensure that you have the required AWS access and your target EC2 instances have attached an IAM instance profile. To know more checkout [Systems Manager Docs](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-launch-managed-instance.html).
    - Ensure to create a Kubernetes secret having the AWS access configuration(key) in the `CHAOS_NAMESPACE`. A sample secret file looks like:

        ```yaml
        apiVersion: v1
        kind: Secret
        metadata:
          name: cloud-secret
        type: Opaque
        stringData:
          cloud_config.yml: |-
            # Add the cloud AWS credentials respectively
            [default]
            aws_access_key_id = XXXXXXXXXXXXXXXXXXX
            aws_secret_access_key = XXXXXXXXXXXXXXX
        ```
    - If you change the secret key name (from `cloud_config.yml`) please also update the `AWS_SHARED_CREDENTIALS_FILE` 
    ENV value on `experiment.yaml`with the same name.
    
## Default Validations

??? info "View the default validations" 
    - EC2 instance should be in healthy state.

## Minimal RBAC configuration example (optional)

!!! tip "NOTE"   
    If you are using this experiment as part of a litmus workflow scheduled constructed & executed from chaos-center, then you may be making use of the [litmus-admin](https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml) RBAC, which is pre installed in the cluster as part of the agent setup.

    ??? note "View the Minimal RBAC permissions"

        ```yaml
        ---
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: aws-ssm-chaos-by-tag-sa
          namespace: default
          labels:
            name: aws-ssm-chaos-by-tag-sa
            app.kubernetes.io/part-of: litmus
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRole
        metadata:
          name: aws-ssm-chaos-by-tag-sa
          labels:
            name: aws-ssm-chaos-by-tag-sa
            app.kubernetes.io/part-of: litmus
        rules:
        # Create and monitor the experiment & helper pods
        - apiGroups: [""]
          resources: ["pods"]
          verbs: ["create","delete","get","list","patch","update", "deletecollection"]
        # Performs CRUD operations on the events inside chaosengine and chaosresult
        - apiGroups: [""]
          resources: ["events"]
          verbs: ["create","get","list","patch","update"]
        # Fetch configmaps & secrets details and mount it to the experiment pod (if specified)
        - apiGroups: [""]
          resources: ["secrets","configmaps"]
          verbs: ["get","list",]
        # Track and get the runner, experiment, and helper pods log 
        - apiGroups: [""]
          resources: ["pods/log"]
          verbs: ["get","list","watch"]  
        # for creating and managing to execute comands inside target container
        - apiGroups: [""]
          resources: ["pods/exec"]
          verbs: ["get","list","create"]
        # for configuring and monitor the experiment job by the chaos-runner pod
        - apiGroups: ["batch"]
          resources: ["jobs"]
          verbs: ["create","list","get","delete","deletecollection"]
        # for creation, status polling and deletion of litmus chaos resources used within a chaos workflow
        - apiGroups: ["litmuschaos.io"]
          resources: ["chaosengines","chaosexperiments","chaosresults"]
          verbs: ["create","list","get","patch","update","delete"]
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRoleBinding
        metadata:
          name: aws-ssm-chaos-by-tag-sa
          labels:
            name: aws-ssm-chaos-by-tag-sa
            app.kubernetes.io/part-of: litmus
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: ClusterRole
          name: aws-ssm-chaos-by-tag-sa
        subjects:
        - kind: ServiceAccount
          name: aws-ssm-chaos-by-tag-sa
          namespace: default
        ```
        
        Use this sample RBAC manifest to create a chaosServiceAccount in the desired (app) namespace. This example consists of the minimum necessary role permissions to execute the experiment.

## Experiment tunables

??? info "check the experiment tunables"
    <h2>Mandatory Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr> 
        <td> EC2_INSTANCE_TAG </td>
        <td> Instance Tag to filter the target ec2 instance</td>
        <td> The EC2_INSTANCE_TAG should be provided as <code>key:value</code> ex: <code>chaos:ssm</code> </td>
      </tr>
      <tr>
        <td> REGION </td>
        <td> The region name of the target instace</td>
        <td> </td>
      </tr> 
    </table>
    
    <h2>Optional Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr> 
        <td> INSTANCE_AFFECTED_PERC </td>
        <td> The Percentage of total ec2 instance to target </td>
        <td> Defaults to 0 (corresponds to 1 instance), provide numeric value only </td>
      </tr>
      <tr> 
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The total time duration for chaos insertion (sec) </td>
        <td> Defaults to 30s </td>
      </tr>
      <tr> 
        <td> CHAOS_INTERVAL </td>
        <td> The interval (in sec) between successive chaos injection</td>
        <td> Defaults to 60s </td>
      </tr>  
      <tr> 
        <td> AWS_SHARED_CREDENTIALS_FILE </td>
        <td> Provide the path for aws secret credentials</td>
        <td> Defaults to <code>/tmp/cloud_config.yml</code> </td>
      </tr>
      <tr> 
        <td> DOCUMENT_NAME </td>
        <td> Provide the name of addded ssm docs (if not using the default docs)</td>
        <td> Default to LitmusChaos-AWS-SSM-Doc</td>
      </tr>
      <tr> 
        <td> DOCUMENT_FORMAT </td>
        <td> Provide the format of the ssm docs. It can be YAML or JSON</td>
        <td> Defaults to <code>YAML</code> </td>
      </tr>
      <tr> 
        <td> DOCUMENT_TYPE </td>
        <td> Provide the document type of added ssm docs (if not using the default docs)</td>
        <td> Defaults to <code>Command</code> </td>
      </tr>
      <tr> 
        <td> DOCUMENT_PATH </td>
        <td> Provide the document path if added using configmaps</td>
        <td> Defaults to the litmus ssm docs path </td>
      </tr>
      <tr> 
        <td> INSTALL_DEPENDENCIES </td>
        <td> Select to install dependencies used to run stress-ng with default docs. It can be either True or False</td>
        <td> Defaults to True </td>
      </tr>
      <tr> 
        <td> NUMBER_OF_WORKERS </td>
        <td> Provide the number of workers to run stress-chaos with default ssm docs</td>
        <td> Defaults to 1 </td>
      </tr>
      <tr> 
        <td> MEMORY_PERCENTAGE </td>
        <td> Provide the memory consumption in percentage on the instance for default ssm docs</td>
        <td> Defaults to 80 </td>
      </tr>
      <tr> 
        <td> CPU_CORE </td>
        <td> Provide the number of cpu cores to run stress-chaos on EC2 with default ssm docs</td>
        <td> Defaults to 0. It means it'll consume all the available cpu cores on the instance </td>
      </tr>
      <tr>
        <td> SEQUENCE </td>
        <td> It defines sequence of chaos execution for multiple instance</td>
        <td> Default value: parallel. Supported: serial, parallel </td>
      </tr>
      <tr>
        <td> RAMP_TIME </td>
        <td> Period to wait before and after injection of chaos in sec </td>
        <td> </td>
      </tr>    
    </table>

## Experiment Examples

### Common and AWS-SSM specific tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and [AWS-SSM specific tunable](AWS-SSM-experiments-tunables.md) to tune the common tunables for all experiments and aws-ssm specific tunables.  

### Target single instance

It will stress a random single ec2 instance with the given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/aws-ssm-chaos-by-tag/instance-tag.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: aws-ssm-chaos-by-tag-sa
  experiments:
  - name: aws-ssm-chaos-by-tag
    spec:
      components:
        env:
        # tag of the ec2 instances
        - name: EC2_INSTANCE_TAG
          value: 'key:value'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the ec2 instances>'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```

### Target Percent of instances

It will stress the `INSTANCE_AFFECTED_PERC` percentage of ec2 instances with the given `EC2_INSTANCE_TAG` tag and `REGION` region.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/aws-ssm/aws-ssm-chaos-by-tag/instance-affected-percentage.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  chaosServiceAccount: aws-ssm-chaos-by-tag-sa
  experiments:
  - name: aws-ssm-chaos-by-tag
    spec:
      components:
        env:
        # percentage of the ec2 instances filtered by tags
        - name: INSTANCE_AFFECTED_PERC
          value: '100'
        # tag of the ec2 instances
        - name: EC2_INSTANCE_TAG
          value: 'key:value'
        # region of the ec2 instance
        - name: REGION
          value: '<region of the ec2 instances>'
        - name: TOTAL_CHAOS_DURATION
          value: '60'
```
