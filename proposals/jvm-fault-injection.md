| title | authors                                  | creation-date | last-updated |
|-------|------------------------------------------|---------------|--------------|
| JVM fault injection | [@bjoky](https://github.com/bjoky)       | 2024-12-05    | 2024-12-05   |

# JVM Fault Injection

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

This is a proposal to add a new type of fault to Litmus that can be used to perform experiments on a Java Virtual Machine (JVM). The proposed two faults, to begin with, are a CPU hog and a memory hog.

## Motivation

Java applications run in a virtual machine. They may behave in upredictable ways with high CPU or memory consumption, which may be different from only high CPU or memory usage in the container it is running. For example, high memory consumption of the JVM can trigger the garbage collection mechanisms.

This makes it interesting to be able to run experiments in Litmus that targets applications running in a JVM.

### Goals

The JVM fault injection should support two different faults: CPU hog/consumption and memory hog/consumption. 

Target Java versions will be 17 and above.

### Non-Goals

The first version of this JVM fault injection will not support anything other than CPU and memory consumption. 

It will for example not use Byteman (see [Alternatives](#alternatives)) or any other tools that could inject any type change or error in the JVM. This could be expanded on in the future.

## Proposal

### Use Cases

#### Use case 1 - Memory consumption

The memory consumption fault will make it possible to consume memory in iterations. 

It will be possible to tune the experiment for amount of memory allocated for each iteration, how long to wait between iterations and how long the total duration will be. 

It will also be possible the configure if the experiment should keep the references to the allocated memory for the total duration of the experiment. If references are kept, it will not be possible for the JVM to garbage collection the memory, which means that the memory will fill up gradually, until an OutOfMemoryError exception is thrown or the experiment ends. After the duration of the experiment, all references will be freed up for garabage collection.  

#### Use case 2 CPU consumption

The CPU consumption fault will make it possible to run CPU intensive operations for a duration of time.

It will be possible to tune the experiment for the number of threads that will run in parallell and for how long the total duration will be.

The operation used to consume CPU will be a Fibonacci number calculation.

### Implementation Details

The JVM fault injection will use the Java Instrumentation API. Using that it will run a Java agent that can alter the existing byte code loaded into the JVM in runtime.

In the case of the memory consumption fault, it will start one thread for that. In the case of the cpu consumption fault, it will start a number of threads, depending on how the experiment was tuned.

The Java agent will be initiated through a Litmus helper, using the litmus-go image. The image will need to include the jar file with the agent, but should be able to use the Java runtime of the target container to initiate the agent.

If the experiment is stopped or interrupted, there must be a way to stop any ongoing agent threads in the target JVMs.

The implementation will be done in several phases, rather than everything at once, so that each step can be properly reviewed. This is a rough outline of the phases:

##### Phase 1
The first phase will be to add the Java agent code to the litmus-go repository.

#### Phase 2
The second phase will be to build the Java code as part of the litmus-go build, and include it in the image.

#### Phase 3
The third phase will be to add the new fault to the litmus-go library and the command call to start the agent. This should include being able to lookup runtime IDs such as process, group and user IDs that are necessary to inject the agent.

#### Phase 4
The fourth phase will be to make the faults available, add to chaos-charts and what else is needed to be able to select it in the Chaos Studio.

## Risks and Mitigations

## Upgrade / Downgrade Strategy

## Drawbacks

## Alternatives

An alternative to this would be to use something like [Byteman](https://byteman.jboss.org/). Byteman is also running as an agent using the Java instrumentation API. The difference is that it allows the user to make any type of change to JVM. This means that it supports other types of use cases than fault injection, such as monitoring and tracing, that may be outside the scope of chaos engineering.

This means that it brings more complexity and a higher threshold to begin using it. It might be overkill for just the simple use cases outlined above.

I think Byteman can be intersting in the long run. And I imagine this JVM Fault Injection could be enhanced in the future to use Byteman instead or Byteman could be added as an additional fault.

## References

- [Java instrumentation API](https://docs.oracle.com/en/java/javase/21/docs/api/java.instrument/java/lang/instrument/Instrumentation.html) 
- [Java instrumentation API introduction](https://medium.com/o11y/what-is-java-instrumentation-why-is-it-needed-1f9aa467433)
- [Byteman](https://byteman.jboss.org/) 
- [Byteman source](https://github.com/bytemanproject/byteman)
