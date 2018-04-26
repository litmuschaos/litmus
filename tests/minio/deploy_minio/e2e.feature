Feature: Test deployment of Minio on Kubernetes PV
  In order to test deployment of Minio on Kubernetes PV
  As an end user
  I need to be able to launch Minio on Kubernetes PV

  Scenario: launch Minio on PV
    Given I have a kubernetes cluster with volume operator installed
    When I launch minio application on volume
    Then wait for "180s"
    And verify minio application is launched successfully on volume
    And verify PVC is bound
    And verify PV is deployed

  Scenario: delete Minio instance
    Given minio application is launched successfully on volume
    When I delete minio instance along with volume
    Then wait for "60s"
    And verify minio application is deleted
    And verify PV is deleted
