## Lenskart
[Lenskart](https://www.lenskart.com) is one of the premium eyewear companies with a presence in the retail sector. [Lenskart](https://www.lenskart.com) has a 
lot of flagship products some of them like BluO and airflex which are very popular among customers. [Lenskart](https://www.lenskart.com) also has subsidiary
retail eyewear companies like [John&Jacobs](https://www.johnjacobseyewear.com/) and [Aqualens](https://aqualens.in/). [Lenskart](https://www.lenskart.com) 
is not only a retail shop but has an omnichannel business model which serves customer from online and offline stores spread not only across India but also
expanding gloablly.

##  **Motivation** 
 
[Lenskart](https://www.lenskart.com) not only serves fashion products to customer but also power eyeglasses and contact lenses which are custom made for every 
customer. This makes it a very niche product as well as an company serving essentials commodities for it's customer. Delivery and ease of ordering from online 
and offline stores is what we take very seriously. Any downtime could cost not only business but also could impact delivery of his/her eyeglasses or contact 
lenses. As an engineering team who is always accepting challenges , we started looking at chaos engineering very seriously once we also faced some major 
downtimes in our platform due to system failure or DDOS attacks. It didn't take us time to realize that just running shop on the cloud was not good enough 
we have to be prepared for chaotic situations, not just that, we also have to simulate it and find weak points in our architecture. So, we first started with manual 
and scripted chaos, but the problem was that they were hard to reproduce and involved a lot of effort to plan and execute them. Then we started exploring
if we could have a framework which could help us maintain our chaos experiments in form of templates. After looking at a couple of tools we narrowed down on
Litmus. 

## **How are we using Litmus**

We started using Litmus from our devops kubernetes cluster , where we first started to test stateful service like redis cluster or elasticsearch. We then
gradually started testing our own application services using Litmus. We have gradually moved from our integration environments to pre-production. We are regularly maturing 
our hypothesis and writing relevant experiments for these services. Currently, we haven't integrated these experiments into our CI/CD pipelines but in the future we have 
plans to run these experiments with every release. 

## **Benefits of using litmus**

We are quite new to Litmus framework but what we have really gained from Litmus is templating of our chaos experiments and able to maintain them in our CVS.
This has really helped us with the reproducibility of the experiments. It has opened new opportunities for us where we can write our own custom experiments
which might be very specific targetting our in-house and public services. We have started ranking the experiments and adding them to our experiment suite so that we 
could now measure the reasiliency of our services. This would also help us in future to be more targeted in our resiliency journey.
