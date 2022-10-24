# Get Started with Litmus SDK

## Introduction
The Litmus SDK provides a simple way to bootstrap your experiment and helps create the aforementioned artifacts in the appropriate directory (i.e., as per the chaos-category) based on an attributes file provided as input by the chart-developer.
The scaffolded files consist of placeholders which can then be filled as desired.

It generates the custom chaos experiments with some default Pre & Post Chaos Checks (AUT & Auxiliary Applications status checks).
It can use the existing chaoslib (present inside /chaoslib directory), if available else It will create a new chaoslib inside the corresponding directory.

## Demo Recording

**UseCase:** Create a pod cpu stress experiment, which execs inside the target pod and run md5sum command

**Steps:**

1. Clone the litmus-go repository and navigate to the contribute/developer-guide directory [0:23-0:40](https://youtu.be/3oueCZ-O_gM?t=23)
2. Generate experiment code [0:41-2:51](https://youtu.be/3oueCZ-O_gM?t=41)
3. Add stead-state checks and experiment business logic [2:52-5:17](https://youtu.be/3oueCZ-O_gM?t=173)
4. Build go-runner image [5:18-6:30](https://youtu.be/3oueCZ-O_gM?t=318)
5. Create charts and add them inside the chaos-charts repo [6:32-10:25](https://youtu.be/3oueCZ-O_gM?t=392)
6. Create a new chaos hub [10:27-12:03](https://youtu.be/3oueCZ-O_gM?t=627)
7. Run the experiment [12:04-18:03](https://youtu.be/3oueCZ-O_gM?t=724)