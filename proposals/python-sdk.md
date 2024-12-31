| title                 | authors                            | creation-date | last-updated |
|-----------------------|------------------------------------|---------------|--------------|
| add litmus python sdk | [@inpyu](https://github.com/inpyu) | 2024-09-07    | 2024-09-07   |

# Adding Litmus python SDK

- [Adding Litmus python SDK](#adding-litmus-python-sdk)
    - [Summary](#summary)
    - [Motivation](#motivation)
        - [Goals](#goals)
        - [Non-Goals](#non-goals)
    - [Proposal](#proposal)
        - [Use Cases](#use-cases)
        - [Implementation Details](#implementation-details)
            - [Initialize client](#initialize-client)
            - [Use Client](#use-client)
    - [Risks and Mitigations](#risks-and-mitigations)
    - [Upgrade / Downgrade Strategy](#upgrade--downgrade-strategy)
    - [Drawbacks](#drawbacks)
    - [Alternatives](#alternatives)
    - [References](#references)

## Summary

The purpose of litmus-python-sdk is to provide a client that can easily access to auth and backend server of litmus.

## Motivation

Litmuschaos’ backend server uses graphQL as an API communication method.
Graphql is not as familiar to developers as REST API, so it is difficult to call backend server directly.
Therefore we planned to add a Python-based SDK that makes developers to communicate easily with litmus backend server.
The SDK also provides an interface to communicate with the auth server to wrap the entire litmus control plane.

### Goals

- Add client calling the API for Auth Server
- Add client calling graphQL for Backend Server


### Non-Goals

- Changing APIs that auth server and backend server already provide is non-goal

## Proposal

### Use Cases

In organization, litmusChaos administrators can call python SDK to manage multiple users and projects.

### Implementation Details

#### Initialize client

```python
class LitmusClient:
    def __init__(self, host_url, username, password):
        self.host_url = host_url
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.session.auth = (username, password)

    def create_project(self, project_name, description, tags):
        url = f"{self.host_url}/projects"
        payload = {
            "projectName": project_name,
            "description": description,
            "tags": tags
        }
        response = self.session.post(url, json=payload)

        if response.status_code == 201:
            return response.json()
        else:
            response.raise_for_status()
            
def init():
    host_url = "http://localhost:3000"
    username = "admin"
    password = "litmus"
    return LitmusClient(host_url, username, password)

```
#### Use Client
```python
def execute():
    client = init()

    project_name = "demo project"
    description = "demo project description"
    tags = ["litmus", "chaos"]

    response = client.create_project(project_name, description, tags)
    print(response)

```
## Risks and Mitigations

## Upgrade / Downgrade Strategy

## Drawbacks

It will be a great opportunity for administrators of litmusChaos to manage users and conduct experiments more conveniently.

## Alternatives

This is the first python sdk we created in Litmus. No other alternatives exist.

## References
