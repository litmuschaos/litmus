| title               | authors                              | creation-date | last-updated |
|---------------------|--------------------------------------|---------------|--------------|
| add litmus java sdk | [@jemlog](https://github.com/jemlog) | 2024-09-07    | 2024-09-07   |

# Adding Litmus Java SDK

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
  - [Use Cases](#use-cases)
  - [Implementation Details](#implementation-details)
- [Risks and Mitigations](#risks-and-mitigations)
- [Upgrade / Downgrade Strategy](#upgrade--downgrade-strategy)
- [Drawbacks](#drawbacks)
- [Alternatives](#alternatives)
- [References](#references)

## Summary

The purpose of litmus-java-sdk is to provide a client that can easily access to auth and backend server of litmus.

## Motivation

Litmuschaos’ backend server uses graphQL as an API communication method. 
Graphql is not as familiar to developers as REST API, so it is difficult to call backend server directly. 
Therefore we planned to add a Java-based SDK that makes developers to communicate easily with litmus backend server. 
The SDK also provides an interface to communicate with the auth server to wrap the entire litmus control plane.

### Goals

- Add client calling the API for Auth Server
- Add client calling graphQL for Backend Server


### Non-Goals

- Changing APIs that auth server and backend server already provide is non-goal
- Add auto configuration for SpringBoot is non-goal

## Proposal

### Use Cases

In organization, litmusChaos administrators can call java SDK to manage multiple users and projects.

### Implementation Details

```java
public void call(){
    // create client
    LitmusClient litmusClient = new LitmusClient("test_user");
    // method call
    CreateProjectResponse response = litmusClient.createProject("sample_project");
}
```

## Risks and Mitigations

## Upgrade / Downgrade Strategy

## Drawbacks

It will be a great opportunity for administrators of litmusChaos to manage users and conduct experiments more conveniently.

## Alternatives

This is the first java sdk we created in Litmus. No other alternatives exist.

## References
