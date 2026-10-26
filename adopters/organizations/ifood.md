## iFood
[iFood](https://ifood.com.br) is a Brazilian online food ordering and food delivery platform. It operates mainly in Brazil and Mexico, after it merged its businesses in Argentina and Colombia with rival PedidosYa.

## How are we using Litmus
We have been using Litmus 2.X at iFood for a couple of months, replacing chaostoolkit as it provides a wider range of experiments out-of-the-box. We've started using it to validate the fallback mechanisms of critical services monthly. Right now, we are expanding its usage to go further and inject failures to drop access to databases, redis, Kafka and AWS services and learn from it and take some countermeasures to improve the critical services.
I hope Litmus to become the de-facto tool to implement Chaos Engineering in a simple manner.
