| title | authors                                  | creation-date | last-updated |
|-------|------------------------------------------|---------------|--------------|
| Replace mongoDB features not supported by AWS | [@kwx4957](https://github.com/kwx4957) |  |   |

### Summary

There are some operators that are supported by mongoDB but not by aws documentDB. Enhancing this feature with other features or code would make LitmusChaos more developer-friendly on AWS.

### Goals 

- Changing features not supported by the cloud environment (AWS) with alternative operators or in code

### Implementation Details
[AWS support api scanning](https://docs.aws.amazon.com/documentdb/latest/developerguide/migration-playbook.html) 

As a result of using these features, the two operators $facet and $bucket are not supported by AWS. We are using the following features in graphQL and expect that modifying them with other features or code will make it easier to run LitmusChaos on AWS. 

```
he following 2 unsupported operators were found:
  $facet | found 8 time(s)
  $bucket | found 1 time(s)

Unsupported operators by filename and line number:
  $facet | lines = found 8 time(s)
    ../../litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/service.go | lines = [664, 841]
    ../../litmus/chaoscenter/graphql/server/pkg/chaos_experiment/handler/handler.go | lines = [733, 955, 1131]
    ../../litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/handler/handler.go | lines = [531]
    ../../litmus/chaoscenter/graphql/server/pkg/environment/handler/handler.go | lines = [346]
    ../../litmus/chaoscenter/graphql/server/pkg/chaoshub/service.go | lines = [922]
  $bucket | lines = found 1 time(s)
    ../../litmus/chaoscenter/graphql/server/pkg/chaos_experiment/handler/handler.go | lines = [1106]
```


## References
[issue#4459](https://github.com/litmuschaos/litmus/issues/4459)  
[AWS support api](https://docs.aws.amazon.com/documentdb/latest/developerguide/mongo-apis.html#w144aac17c19b5b3)  
[Azure support api](https://learn.microsoft.com/es-es/azure/cosmos-db/mongodb/feature-support-36#aggregation-stages)