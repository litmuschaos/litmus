### Component-Wise Code Owners & Primary Reviewers

Area             |Components                       |Source                                           |Maintainers                                 |Reviewers|
-----------------|---------------------------------|-------------------------------------------------|--------------------------------------------|-------- |
control-plane    |chaos-manager                    |graphql-server                                   |@amityt, @Jonsy13, @imrajdas, @SarthakJain26                 |@gdsoumya, @Saranya-jena, @arkajyotiMukherjee|
control-plane    |chaos-dashboard                  |frontend, component-library                       |@arkajyotiMukherjee, @S-ayanide            |@amityt, @SahilKr24, @hrishavjha|
execution-plane  |subscriber, event-tracker        |cluster-agents                                   |@gdsoumya, @imrajdas, @SarthakJain26         |@amityt, @Jonsy13, @ispeakc0de, @Adarshkumar14         |
execution-plane  |litmus-core                      |chaos-operator, chaos-runner, elves, chaos-exporter |@ksatchit, @ispeakc0de, @chandankumar4                  |@uditgaurav, @neelanjan          |   
chaos-experiments|experiment-lib, chaoshub         |litmus-go, test-tools, chaos-charts              |@uditgaurav, @ispeakc0de, @ksatchit, @Vr00mm| @neelanjan00, @Adarshkumar14, @avaakash     |
chaos-plugins    |cli, plugin infra, developer portals                 |litmusctl, backstage-plugin                                        |@Saranya-jena, @SarthakJain26, @namkyu1999               |@Jonsy13, @ajeshbaby, @imrajdas         | 
chaos-sdk        |go/python/ansible sdk           |litmus-go,litmus-python,litmus-ansible           |@oumkale, @ispeakc0de, @ksatchit            |@neelanjan00, @avaakash, @uditgaurav         | 
e2e              |e2e-suite, e2e-dashboard         |litmus-e2e                                       |@uditgaurav, @Jonsy13                       |@neelanjan00, @S-ayanide, @avaakash         |
integrations     |CI/CD plugins, wrappers          |chaos-ci-lib, gitlab-templates, github-actions   |@uditgaurav, @ksatchit                    |@ispeakc0de, @Adarshkumar14         | 
helm-charts      |control-plane, agent, experiments|litmus-helm                                      |@Jasstkn, @ispeakc0de, @imrajdas, @Jonsy13             |@ksatchit, @uditgaurav         |
documentation    |platform-docs, experiment-docs   |litmus-docs, mkdocs                              |@neelanjan00, @umamukkara, @ispeakc0de     |@ksatchit, @ajeshbaby, @amityt, @uditgaurav         |
websites         |project website, chaoshub, documentation  |litmus-website, charthub, litmus-docs   |@umamukkara, @arkajyotiMukherjee, @S-ayanide    |@SahilKr24, @hrishavjha, @ajeshbaby        |

### Consolidated Maintainers List 

```
"Amit Kumar Das",@amityt,amit.das@harness.io
"Arkojyoti Mukherjee",@arkajyotiMukherjee,arko@harness.io
"Chandan Kumar",@chandankumar4,ckamtaprasad@msystechnologies.com
"Karthik Satchitanand",@ksatchit,karthik.s@harness.io
"Maria Kotlyarevskaya",@Jasstkn,jasssstkn@yahoo.com
"Namkyu Park",namkyu1999,lak9348@gmail.com
"Neelanjan Manna",@neelanjan00,neelanjan.manna@harness.io
"Oum Nivrati Kale",@oumkale,imkaleoum@gmail.com
"Raj Das",@imrajdas,rajbabu.das@harness.io
"Rémi Ziolkowski",@Vr00mm,remi.ziolkowski-ext@pole-emploi.fr
"Soumya Ghosh Dastidar",@gdsoumya,gdsoumya@gmail.com
"Saranya Jena",@Saranya-jena,saranya.jena@harness.io
"Sarthak Jain",@SarthakJain26,sarthak.jain@harness.io
"Sayan Mondal",@S-ayanide,sayan.mondal@harness.io
"Shubham Chaudhary",@ispeakc0de,shubham.chaudhary@harness.io
"Udit Gaurav",@uditgaurav,udit.gaurav@harness.io
"Vedant Shrotria",@Jonsy13,vedant.shrotria@harness.io
"Uma Mukkara",@umamukkara,umasankar.mukkara@harness.io
```

### Consolidated Reviewers List

```
"Adarsh Kumar",@Adarshkumar14,adarsh.kumar@harness.io
"Akash Srivastava",@avaakash,akash.srivastava@harness.io
"Ajesh Baby",@ajeshbaby,ajesh.baby@harness.io
"Sahil Kumar",@SahilKr24,sahil.kumar@harness.io
"Hrishav Kumar Jha",@hrishavjha,hrishav.kumar@harness.io
```

### Emeritus Maintainers

```
"Jayesh Kumar",@k8s-dev,tankjaye@amazon.com,Amazon
"Sumit Nagal",@sumitnagal,snagal@salesforce.com,Salesforce
```

### Emeritus Reviewers

```
"Amit Bhatt",@amitbhatt818,amit.bhatt@mayadata.io,MayaData
"Ishan Gupta",@ishangupta-ds,ishan@chaosnative.com,ChaosNative
"Rahul M Chheda",@rahulchheda,rahul.chheda1997@gmail.com,Independent
```
