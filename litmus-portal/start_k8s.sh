#!/bin/bash
kubectl apply -f ./backend/k8s-deployment.yml
kubectl apply -f ./frontend/k8s-deployment.yml