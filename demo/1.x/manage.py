#!/usr/bin/env python3

import argparse
import os
import json
import sys
import time
from datetime import datetime
import subprocess
import yaml
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_color(text: str, color:bcolors = bcolors.BOLD):
    """
    Utility method to print colored text to stdout.

    :param text:        The text to print
    :param color:       The bcolors to print text in (defaults to bold)
    :return:
    """
    print(f"{color}{text}{bcolors.ENDC}")

def run_shell(cmd: str):
    """
    Runs a shell command and prints command to stdout before
    running so user can see what was run

    :param cmd:     The shell command to run
    :return:
    """
    print_color(f"** RUNNING: {cmd}")
    os.system(cmd)

# Subcommand options
def start(args):
    if (f"{args.platform}" == "GKE"):
        """
        Start a GKE Cluster with the demo environment deployed.
        """
        print_color(f"Starting GKE cluster in project {args.project} with name {args.name} in zone {args.zone}", bcolors.OKBLUE)

        # Ensure GCloud SDK is up to date
        run_shell("gcloud components update")

        # Set GCloud project
        run_shell(f"gcloud config set project \"{args.project}\"")

        # Spinup cluster
        run_shell(f"gcloud container clusters create {args.name} --zone {args.zone} --cluster-version 1.14.10-gke.17 --machine-type n1-standard-2 --no-enable-autoupgrade")

        # Get kubectl credentials
        run_shell(f"gcloud container clusters get-credentials {args.name} --zone {args.zone}")

        print_color("\nGKE Cluster Running with following nodes:\n")
        run_shell(f"kubectl get nodes")

        # Deploy all demo apps
        run_shell("kubectl create -f ./deploy/sock-shop.yaml")
        run_shell("kubectl create -f ./deploy/random-log-counter.yaml")

        # Deploy Litmus ChaosOperator to run Experiments that create incidents
        run_shell("kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.1.0.yaml")

        # Install Litmus Experiments - TEMP Workaround to set experiment versions until Chaos Hub supports in URL
        run_shell("curl -sL https://github.com/litmuschaos/chaos-charts/archive/2.1.0.tar.gz -o litmus.tar.gz")
        run_shell("tar -zxvf litmus.tar.gz")
        run_shell("rm litmus.tar.gz")
        run_shell("find chaos-charts-2.1.0 -name experiments.yaml | grep generic | xargs kubectl apply -n sock-shop -f")
        #run_shell("kubectl create -f https://hub.litmuschaos.io/api/chaos?file=charts/generic/experiments.yaml -n sock-shop")
        #run_shell("kubectl create -f https://hub.litmuschaos.io/api/chaos?file=charts/kafka/experiments.yaml -n kafka")

        # Create the chaos serviceaccount with permissions needed to run the generic K8s experiments
        run_shell("kubectl create -f ./deploy/litmus-rbac.yaml")

        # Get ingress IP address
        run_shell("sleep 60")  # Wait 1 min for ingress to finish setting up
        print_color("\nIngress Details:\n", bcolors.UNDERLINE)
        run_shell("kubectl get ingress basic-ingress --namespace=sock-shop")

        try:
            ingress_ip = \
            json.loads(os.popen('kubectl get ingress basic-ingress --namespace=sock-shop -o json').read())["status"][
                "loadBalancer"]["ingress"][0]["ip"]
            print_color(f"\nYou can access the web application in a few minutes at: http://{ingress_ip}\n\n")
        except:
            print_color("Ingress still being setup. Use the following command to get the IP later:", bcolors.WARNING)
            print_color("\tkubectl get ingress basic-ingress --namespace=sock-shop", bcolors.WARNING)

        print_color("***************************************************************************************************", bcolors.WARNING)
        print_color(f"* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Finished creating cluster.", bcolors.WARNING)
        print_color("* Please wait at least 15 minutes for environment to become fully initalised.")
        print_color("* The ingress to access the web application from your browser can take at least 5 minutes to create.", bcolors.WARNING)
        print_color("*", bcolors.WARNING)
        print_color("*", bcolors.WARNING)
        print_color("* IMPORTANT: To reliably detect Chaos experiment incidents you must reduce the Refractory Period for your account to 10 minutes.", bcolors.WARNING)
        print_color("*", bcolors.WARNING)
        print_color("***************************************************************************************************\n\n", bcolors.WARNING)

    elif (f"{args.platform}" == "kind"):
        """
        Start a KinD cluster with the demo environment
        """
        print_color(f"Setup kind cluster", bcolors.OKBLUE)

        # install kind if not found
        if not os.path.isfile('/usr/local/bin/kind'):
            # Installing kind cluster
            run_shell(f"curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.11.1/kind-$(uname)-amd64")
            run_shell(f"chmod +x ./kind")
            run_shell(f"mv ./kind /usr/local/bin/kind")

        # Verify the kind installation
        run_shell(f"kind version")

        print_color(f"Starting single node {args.platform} cluster with default name kind", bcolors.OKBLUE)

        # Start a single node kind cluster
        run_shell(f"kind create cluster --config kind-setup/kind-config.yaml --wait=5m")
        run_shell(f"kubectl cluster-info --context kind-kind")

        # Getting the nodes of the cluster
        print_color("\KinD Cluster Running with following nodes:\n")
        run_shell(f"kubectl get nodes\n")
        
        # Deploy all demo apps
        run_shell("kubectl create -f ./deploy/sock-shop.yaml")
        run_shell("kubectl create -f ./deploy/random-log-counter.yaml")

        # Deploy Litmus ChaosOperator to run Experiments that create incidents
        run_shell("kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.1.0.yaml")

        # Install Litmus Experiments - TEMP Workaround to set experiment versions until Chaos Hub supports in URL
        run_shell("curl -sL https://github.com/litmuschaos/chaos-charts/archive/2.1.0.tar.gz -o litmus.tar.gz")
        run_shell("tar -zxvf litmus.tar.gz")
        run_shell("rm litmus.tar.gz")
        run_shell("find chaos-charts-2.1.0 -name experiments.yaml | grep generic | xargs kubectl apply -n sock-shop -f")

        # Create the chaos serviceaccount with permissions needed to run the generic K8s experiments
        run_shell("kubectl create -f ./deploy/litmus-rbac.yaml")

        # Get ingress IP address
        run_shell("sleep 100")  # Wait 1 min for ingress to finish setting up and operator pods to come in Running state
        print_color("* Please wait for few minutes for environment to become fully initalised.")

    if (f"{args.platform}" == "EKS"):
        """
        Start a EKS Cluster with the demo environment deployed.
        """
        print_color(f"Starting EKS cluster with name {args.name} in region {args.awsregion}", bcolors.OKBLUE)

        # Spinup cluster
        run_shell(f"eksctl create cluster --region {args.awsregion} --node-type {args.awsnodetype} --nodes {args.awsnodes} "
                  f"--nodes-min {args.awsnodesmin} --nodes-max {args.awsnodesmax} --name {args.name}")

        # Get kubectl credentials
        run_shell(f"eksctl utils write-kubeconfig --cluster={args.name}")

        print_color("\nEKS Cluster Running with following nodes:\n")
        run_shell(f"kubectl get nodes")

        # Deploy AWS ALB Ingress Controller
        run_shell(f"eksctl utils associate-iam-oidc-provider --region {args.awsregion} --cluster {args.name} --approve")
        # Check if the ALBIngressControllerPolicy exists
        account_id = subprocess.getoutput("aws sts get-caller-identity --output json --query 'Account'").replace('"', '')
        policy_arn = 'arn:aws:iam::' + account_id + ':policy/ALBIngressControllerIAMPolicy'
        policy_check_arg = 'aws iam get-policy --policy-arn ' + policy_arn
        policy_check = subprocess.getoutput(policy_check_arg)
        if 'NoSuchEntity' in policy_check:
            run_shell(f"curl -o /tmp/iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/iam-policy.json")
            run_shell(f"aws iam create-policy --policy-name ALBIngressControllerIAMPolicy --policy-document file:///tmp/iam-policy.json")
        run_shell(f"kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/rbac-role.yaml")
        run_shell(f"eksctl create iamserviceaccount --region {args.awsregion} --name alb-ingress-controller "
                  f"--namespace kube-system --cluster {args.name} --attach-policy-arn {policy_arn} --override-existing-serviceaccounts --approve")
        run_shell(f"kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/alb-ingress-controller.yaml")
        run_shell('kubectl patch deployment alb-ingress-controller -n kube-system -p \'{"spec": {"template": {"spec": {"containers": [{"name": "alb-ingress-controller", "args": ["--ingress-class=alb", "--cluster-name=%s"]}]}}}}\'' % args.name)

        # Deploy all demo apps
        run_shell("kubectl create -f ./deploy/sock-shop.yaml")
        run_shell("kubectl annotate ingress basic-ingress -n sock-shop alb.ingress.kubernetes.io/scheme='internet-facing' kubernetes.io/ingress.class='alb'")
        run_shell("kubectl create -f ./deploy/random-log-counter.yaml")

        # Deploy Litmus ChaosOperator to run Experiments that create incidents
        run_shell("kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v2.1.0.yaml")

        # Install Litmus Experiments - TEMP Workaround to set experiment versions until Chaos Hub supports in URL
        run_shell("curl -sL https://github.com/litmuschaos/chaos-charts/archive/2.1.0.tar.gz -o litmus.tar.gz")
        run_shell("tar -zxvf litmus.tar.gz")
        run_shell("rm litmus.tar.gz")
        run_shell("find chaos-charts-2.1.0 -name experiments.yaml | grep generic | xargs kubectl apply -n sock-shop -f")
        #run_shell("kubectl create -f https://hub.litmuschaos.io/api/chaos?file=charts/generic/experiments.yaml -n sock-shop")
        #run_shell("kubectl create -f https://hub.litmuschaos.io/api/chaos?file=charts/kafka/experiments.yaml -n kafka")

        # Create the chaos serviceaccount with permissions needed to run the generic K8s experiments
        run_shell("kubectl create -f ./deploy/litmus-rbac.yaml")

        # Get ingress IP address
        run_shell("sleep 60")  # Wait 1 min for ingress to finish setting up
        print_color("\nIngress Details:\n", bcolors.UNDERLINE)
        run_shell("kubectl get ingress basic-ingress --namespace=sock-shop")

        try:
            ingress_ip = \
            json.loads(os.popen('kubectl get ingress basic-ingress --namespace=sock-shop -o json').read())["status"][
                "loadBalancer"]["ingress"][0]["ip"]
            print_color(f"\nYou can access the web application in a few minutes at: http://{ingress_ip}\n\n")
        except:
            print_color("Ingress still being setup. Use the following command to get the IP later:", bcolors.WARNING)
            print_color("\tkubectl get ingress basic-ingress --namespace=sock-shop", bcolors.WARNING)

        print_color("***************************************************************************************************", bcolors.WARNING)
        print_color(f"* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Finished creating cluster.", bcolors.WARNING)
        print_color("* Please wait at least 15 minutes for environment to become fully initalised.")
        print_color("* The ingress to access the web application from your browser can take at least 5 minutes to create.", bcolors.WARNING)
        print_color("*", bcolors.WARNING)
        print_color("*", bcolors.WARNING)
        print_color("* IMPORTANT: To reliably detect Chaos experiment incidents you must reduce the Refractory Period for your account to 10 minutes.", bcolors.WARNING)
        print_color("*", bcolors.WARNING)
        print_color("***************************************************************************************************\n\n", bcolors.WARNING)

def stop(args):
    if (f"{args.platform}" == "GKE"):
        """
        Shutdown the GKE Cluster with the demo environment deployed.
        """
        print_color(f"Stopping GKE cluster in project {args.project} with name {args.name} in zone {args.zone}", bcolors.OKBLUE)

        # Set GCloud project
        run_shell(f"gcloud config set project \"{args.project}\"")

        # Stop cluster
        run_shell(f"gcloud container clusters delete {args.name} --zone {args.zone}")
    elif (f"{args.platform}" == "kind"):
        """
        Shutdown the kind cluster with the demo environment deployed.
        """
        print_color(f"Stopping kind cluster", bcolors.OKBLUE)
        run_shell(f"kind delete cluster")

    elif (f"{args.platform}" == "EKS"):
        """
        Shutdown the EKS Cluster with the demo environment deployed.
        """
        print_color(f"Stopping EKS cluster with name {args.name} in {args.awsregion}", bcolors.OKBLUE)

        # Stop cluster
        run_shell(f"eksctl delete cluster --name={args.name} --region={args.awsregion}")

class ExperimentResult(object):
    """
    Holds Experiment Result
    """

    def __init__(self, name:str, status:str, startTime:datetime):
        self.name = name
        self.status = status
        self.startTime = startTime

def run_experiment(experiment: str):
    """
    Run a specific experiment

    :param experiment:  The name of the experiment as defined in the YAML, i.e. container-kill
    :return:            ExperimentResult object with results of experiment
    """
    print_color("***************************************************************************************************", bcolors.OKBLUE)
    print_color(f"* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Experiment: {experiment}", bcolors.OKBLUE)
    print_color("***************************************************************************************************", bcolors.OKBLUE)

    experiment_file = experiment + ".yaml"

    # Set namespace to check
    with open(f"./litmus/{experiment_file}") as f:
        spec = yaml.load(f, Loader=yaml.FullLoader)
        result_name = spec['metadata']['name']
        namespace = spec['metadata']['namespace']

    print_color(f"Running Litmus ChaosEngine Experiment {experiment_file} in namespace {namespace}")
    print_color(f"Deploying {experiment_file}...")
    run_shell(f"kubectl delete chaosengine {result_name} -n {namespace}")
    run_shell(f"kubectl create -f ./litmus/{experiment_file} -n {namespace}")

    # Check status of experiment execution
    startTime = datetime.now()
    print_color(f"{startTime.strftime('%Y-%m-%d %H:%M:%S')} Running experiment...")
    expStatusCmd = "kubectl get chaosengine " + result_name + " -o jsonpath='{.status.experiments[0].status}' -n " + namespace
    run_shell(expStatusCmd)
    logs_cmd = f"kubectl logs --since=10s -l name={experiment} -n {namespace}"
    print(f"\n{bcolors.OKGREEN}//** Experiment Logs ({logs_cmd}) **//\n\n")
    try:
        while subprocess.check_output(expStatusCmd, shell=True).decode('unicode-escape') != "Completed":
            os.system(logs_cmd)
            os.system("sleep 10")

        print(f"\n\n//** End of Experiment Logs **//{bcolors.ENDC}\n")

        # View experiment results
        run_shell(f"kubectl describe chaosresult {result_name}-{experiment} -n {namespace}")

    except:
        print_color("User has cancelled script execution.", bcolors.FAIL)
        sys.exit(2)

    # Store Experiment Result
    status = subprocess.check_output("kubectl get chaosresult " + result_name + "-" + experiment + " -n " + namespace + " -o jsonpath='{.status.experimentStatus.verdict}'", shell=True).decode('unicode-escape')
    return ExperimentResult(experiment, status, startTime)

def test(args):
    """
    Run Litmus ChaosEngine Experiments inside the demo environment.
    Each experiment is defined under its own yaml file under the /litmus directory. You can run
    a specific experiment by specifying a test name that matches one of the yaml file names in the directory
    but by default all '*' experiments will be run with 20 minute wait period between each experiment
    to ensure that it doesn't cluster the incidents together into one incident
    """
    startTimeStamp = time.monotonic()
    #for GKE platform
    if (f"{args.platform}" == "GKE" and (f"{args.type}" == "all")):
        experiments = sorted(os.listdir('./litmus'))

    elif (f"{args.platform}" == "GKE" and (f"{args.type}" == "pod")):
        experiments = ["container-kill.yaml","disk-fill","pod-cpu-hog","pod-delete","pod-memory-hog","pod-network-corruption","pod-network-latency","pod-network-loss"]

    elif (f"{args.platform}" == "GKE" and (f"{args.type}" == "node")):
        kind_supported = ["node-cpu-hog","node-memory-hog"]

    #for kind platform
    if ((f"{args.platform}" == "kind") and (f"{args.type}" == "all")):
        kind_supported = ["pod-delete","container-kill","node-cpu-hog","node-memory-hog"]
        experiments=[s + ".yaml" for s in kind_supported]

    elif ((f"{args.platform}" == "kind") and (f"{args.type}" == "pod")):
        experiments = ["node-cpu-hog.yaml","node-memory-hog.yaml"]

    elif ((f"{args.platform}" == "kind") and (f"{args.type}" == "node")):
        experiments = ["node-cpu-hog.yaml","node-memory-hog.yaml"]

    # for EKS platform
    if (f"{args.platform}" == "EKS" and (f"{args.type}" == "all")):
        experiments = sorted(os.listdir('./litmus'))

    elif (f"{args.platform}" == "EKS" and (f"{args.type}" == "pod")):
        experiments = ["container-kill.yaml", "disk-fill", "pod-cpu-hog", "pod-delete", "pod-memory-hog",
                       "pod-network-corruption", "pod-network-latency", "pod-network-loss"]

    elif (f"{args.platform}" == "EKS" and (f"{args.type}" == "node")):
        kind_supported = ["node-cpu-hog", "node-memory-hog"]

    experiment_results = []

    if args.test == '*':
        # Run all experiments in /litmus directory with wait time between them
        print_color(f"Running all Litmus ChaosEngine Experiments with {args.wait} mins wait time between each one...")
        lstindex = len(experiments)
        for experiment_file in experiments:
            result = run_experiment(experiment_file.replace('.yaml', ''))
            experiment_results.append(result)
            print_color(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} Waiting {args.wait} mins before running next experiment...", bcolors.WARNING)
            lstindex -= 1
            if lstindex != 0:
                time.sleep(args.wait * 60)
    else:
        # Check experiment exists
        experiment_file = args.test + ".yaml"
        if experiment_file in experiments:
            result = run_experiment(args.test)
            experiment_results.append(result)
        else:
            print_color(f"ERROR: {experiment_file} not found in ./litmus directory. Please check the name and try again.", bcolors.FAIL)
            sys.exit(2)

    # Print out experiment result summary
    print_color("***************************************************************************************************", bcolors.OKBLUE)
    print_color("* Experiments Result Summary", bcolors.OKBLUE)
    print_color("***************************************************************************************************\n", bcolors.OKBLUE)
    headers = ["#", "Start Time", "Experiment", "Status"]
    row_format = "{:>25}" * (len(headers) + 1)
    print_color(row_format.format("", *headers), bcolors.OKBLUE)
    i = 1
    for result in experiment_results:
        if result.status == "Pass":
            print_color(row_format.format("", str(i), result.startTime.strftime('%Y-%m-%d %H:%M:%S'), result.name,"    "+ result.status + " 'carts-db' Service is up and Running after chaos"), bcolors.OKBLUE)
            i += 1
        else:
            print_color(row_format.format("", str(i), result.startTime.strftime('%Y-%m-%d %H:%M:%S'), result.name, result.status), bcolors.OKBLUE)
            i += 1
    print("\n")
    currentTimeStamp= time.monotonic()
    diffTimeStamp = currentTimeStamp - startTimeStamp
    ty_res = time.gmtime(diffTimeStamp)
    totalTime = time.strftime("%H:%M:%S",ty_res)

    if (f"{args.report}" == "yes"):

        print_color("Creating PDF Report", bcolors.OKBLUE)

        fileName = 'chaos-report.pdf'
        pdf = SimpleDocTemplate(fileName,pagesize=LETTER)
        styles = getSampleStyleSheet()
        data = [None]
        data[0] = ["S.No.", "Start Time", "Experiment", "Status"]

        i =1
        expPassed = 0
        expFailed = 0
        for result in experiment_results:
            if result.status == "Pass":
                data.append([str(i), result.startTime.strftime('%Y-%m-%d %H:%M:%S'), result.name,"    "+ result.status + " 'carts-db' Service is up and Running after chaos"])
                i += 1
                expPassed +=1
            else:
                data.append([str(i), result.startTime.strftime('%Y-%m-%d %H:%M:%S'), result.name,result.status])
                i += 1
                expFailed +=1

        table = Table(data)

        picture = Image("images/litmus.png")
        picture.drawWidth = 100
        picture.drawHeight = 100
        picTable = Table([[picture]],100,100)

        elems = []

        # Adding logo
        elems.append(picTable)
        # Adding title
        text = "LitmusChaos Report <br/> <br/>Experiments Result Summary"
        para = Paragraph(text, styles['Title'])
        elems.append(para)

        ## Adding result table
        elems.append(table)

        style = TableStyle([
            ('BACKGROUND',(0,0),(3,0), colors.green),
            ('TEXTCOLOR',(0,0),(-1,0), colors.whitesmoke),
            ('ALIGN',(0,0),(-1,-1), 'CENTER'),
            ('FONTNAME',(0,0),(-1,0), 'Courier'),
            ('FONTSIZE',(0,0),(-1,0), 14),
            ('BOTTOMPADDING',(0,0),(-1,0), 12),
            ('BACKGROUND',(0,1),(-1,-1), colors.beige),
        ])

        ts = TableStyle([
            ('BOX',(0,0),(-1,-1),1,colors.black)
        ])

        ## Adding table style
        table.setStyle(style)
        table.setStyle(ts)

        para1 = Paragraph("The total number of passed experiments: %s " % str(expPassed), styles['Heading3'])
        elems.append(para1)
        para2 = Paragraph("The total number of failed experiments: %s " % str(expFailed), styles['Heading3'])
        elems.append(para2)
        para3 = Paragraph("The total experiment execution time: %s (HH:MM:SS)" % str(totalTime), styles['Heading3'])
        elems.append(para3)

        pdf.build(elems)
        print_color("PDF Report Created Successfully ", bcolors.OKBLUE)


def list(args):
    """
    List all available Litmus Chaos Experiments available in this repository
    """
    experiments = sorted(os.listdir('./litmus'))
    print_color("Available Litmus Chaos Experiments:\n\n")
    if (f"{args.platform}" == "GKE"):
        i = 1
        for experiment_file in experiments:
            print_color(f"\t{i}. {experiment_file.replace('.yaml', '')}")
            i += 1

    if (f"{args.platform}" == "kind"):
        kind_supported = ["pod-delete","container-kill","node-cpu-hog","node-memory-hog"]
        i = 0
        for i in range(0, len(kind_supported)):
            print_color(f"\t{i+1}. {kind_supported[i]}")
            i += 1

    if (f"{args.platform}" == "EKS"):
        i = 1
        for experiment_file in experiments:
            print_color(f"\t{i}. {experiment_file.replace('.yaml', '')}")
            i += 1

if __name__ == "__main__":

    # Add command line arguments
    parser = argparse.ArgumentParser(description='Spin up a Demo Environment on Kubernetes.')
    subparsers = parser.add_subparsers()

    # Start command
    parser_start = subparsers.add_parser("start", help="Start a Cluster with the demo environment deployed.")
    parser_start.add_argument("-p", "--project", type=str,
                        help="Set GCloud Project to spin GKE cluster up in")
    parser_start.add_argument("-z", "--zone", type=str, default="us-central1-a",
                        help="Set GCloud Zone to spin GKE cluster up in")
    parser_start.add_argument("-n", "--name", type=str, default="litmus-k8s-demo",
                        help="Set GKE/EKS cluster name")
    parser_start.add_argument("-pt", "--platform", type=str, default="kind",
                        help="Set the platform to start with demo enviroment. Available platforms are kind, GKE and EKS. Default value is kind")
    parser_start.add_argument("-awsr", "--awsregion", type=str, default="us-east-1",
                        help="Set the AWS Region to spin EKS cluster up in"),
    parser_start.add_argument("-awsnt", "--awsnodetype", type=str, default="t3a.medium",
                              help="Set the EC2 instance type"),
    parser_start.add_argument("-awsn", "--awsnodes", type=int, default=3,
                        help="Set the number of nodes in the EKS cluster"),
    parser_start.add_argument("-awsnmin", "--awsnodesmin", type=int, default=1,
                        help="Set the minimum number of nodes in the auto-scaling group for the EKS cluster"),
    parser_start.add_argument("-awsnmax", "--awsnodesmax", type=int, default=4,
                        help="Set the maximum number of nodes in the auto-scaling group for the EKS cluster"),
    parser_start.set_defaults(func=start)

    # Test command
    parser_test = subparsers.add_parser("test", help="Run Litmus ChaosEngine Experiments inside litmus demo environment.")
    parser_test.add_argument("-t", "--test", type=str, default="*",
                             help="Name of test to run based on yaml file name under /litmus folder. '*' runs all of them with wait time between each experiement.")
    parser_test.add_argument("-w", "--wait", type=int, default=1,
                             help="Number of minutes to wait between experiments. Defaults to 1 mins to avoid the clustering incidents together.")
    parser_test.add_argument("-pt", "--platform", type=str, default="kind",
                             help="Set the platform to perform chaos. Available platforms are kind, GKE and EKS. Default value is kind")
    parser_test.add_argument("-ty", "--type", type=str, default="all",
                             help="Select the type of chaos to be performed, it can have values pod for pod level chaos,node for infra/node level chaos and all to perform all chaos")
    parser_test.add_argument("-r", "--report", type=str, default="no",
                             help="Select yes to generate the pdf report of the chaos result of different experiment execution")
    parser_test.set_defaults(func=test)

    # List Tests Command
    parser_list = subparsers.add_parser("list", help="List all available Litmus ChaosEngine Experiments available to run.")
    parser_list.add_argument("-pt", "--platform", type=str, default="kind",
                             help="Set the platform to list the chaos experiment available. Available platforms are kind, GKE and EKS. Default value is kind")
    parser_list.set_defaults(func=list)

    # Stop command
    parser_stop = subparsers.add_parser("stop", help="Shutdown the Cluster with the demo environment deployed.")
    parser_stop.add_argument("-p", "--project", type=str,
                        help="Set GCloud Project to spin GKE cluster down in")
    parser_stop.add_argument("-z", "--zone", type=str, default="us-central1-a",
                        help="Set GCloud Zone to spin GKE cluster down in")
    parser_stop.add_argument("-n", "--name", type=str, default="litmus-k8s-demo",
                        help="Set GKE/EKS cluster name")
    parser_stop.add_argument("-awsr", "--awsregion", type=str, default="us-east-1",
                             help="Set AWS Region to spin EKS cluster down in")
    parser_stop.add_argument("-pt", "--platform", type=str, default="kind",
                        help="Set platform which was used to deploy the demo environment. Default value is kind")
    parser_stop.set_defaults(func=stop)
    args = parser.parse_args()
    args.func(args)
