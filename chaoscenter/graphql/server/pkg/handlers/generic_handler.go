package handlers

// InfraManifestHandler  generates the yaml file to install chaos infrastructure
//func InfraManifestHandler(w http.ResponseWriter, r *http.Request) {
//	var (
//		vars  = mux.Vars(r)
//		token = vars["key"]
//	)
//
//	infraId, err := chaos_infra.InfraValidateJWT(token)
//	if err != nil {
//		logrus.Error(err)
//		utils.WriteHeaders(&w, 500)
//		w.Write([]byte(err.Error()))
//	}
//
//	getInfra, err := dbChaosInfra.GetInfra(infraId)
//	if err != nil {
//		logrus.Error(err)
//		utils.WriteHeaders(&w, 500)
//		w.Write([]byte(err.Error()))
//	}
//
//	response, err := handler.GetK8sInfraYaml(getInfra)
//	if err != nil {
//		logrus.Error(err)
//		utils.WriteHeaders(&w, 500)
//		w.Write([]byte(err.Error()))
//	}
//
//	utils.WriteHeaders(&w, 200)
//	w.Write(response)
//}

//var TaskCallback = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//	var payload protos.TaskPayload
//	err := json.NewDecoder(r.Body).Decode(&payload)
//	if err != nil {
//		logrus.WithError(err).Error("error decoding payload")
//		http.Error(w, err.Error(), http.StatusBadRequest)
//		return
//	}
//
//	logFields := logrus.Fields{
//		"taskType":      payload.TaskType,
//		"infraId":       payload.InfraId,
//		"time":          payload.Timeout,
//		"correlationId": payload.CorrelationId,
//	}
//
//	callbackResponse := fmt.Sprintf("Received task callback for taskType: %s", payload.TaskType)
//
//	if payload.TaskID != "" {
//		callbackResponse += fmt.Sprintf(", taskID: %s", payload.TaskID)
//		logFields["taskID"] = payload.TaskID
//	}
//
//	logrus.WithFields(logFields).Info("task response has been successfully received")
//
//	switch payload.TaskType {
//	case protos.TaskType_WORKFLOW_EVENT.String():
//		completed, err := strconv.ParseBool(payload.Args["completed"])
//		if err != nil {
//			logrus.WithFields(logFields).Error(fmt.Errorf("failed to parse completed arg: %w", err))
//			http.Error(w, err.Error(), http.StatusBadRequest)
//			return
//		}
//
//		resp, err := handler2.ChaosWorkflowRunEvent(chaos_workflow.WorkflowRunEvent{
//			WorkflowID:    payload.Args["workflowID"],
//			WorkflowRunID: payload.Args["workflowRunID"],
//			WorkflowName:  payload.Args["workflowName"],
//			ExecutionData: payload.Args["executionData"],
//			InfraDetails: &chaos_workflow.InfraDetails{
//				InfraID: payload.Args["infraID"],
//				Version: payload.Args["version"],
//			},
//			RevisionID: payload.Args["revisionID"],
//			NotifyID: func(s string) *string {
//				if s == "" {
//					return nil
//				}
//				return &s
//			}(payload.Args["notifyID"]),
//			Completed: completed,
//			UpdatedBy: payload.Args["updatedBy"],
//		})
//
//		if err != nil {
//			logrus.WithFields(logFields).WithError(err).Error(fmt.Errorf("failed to handle workflow event"))
//			http.Error(w, err.Error(), http.StatusInternalServerError)
//			return
//		}
//
//		callbackResponse = fmt.Sprintf("%s, response: %s", callbackResponse, resp)
//
//	case protos.TaskType_K8S_RESOURCE_DISCOVERY.String():
//		var response string
//		if payload.Args["status"] != "" {
//			if payload.Args["status"] == "success" {
//				response = payload.Args["message"]
//				callbackResponse = fmt.Sprintf("%s, status: %s", callbackResponse, protos.TaskStatus_SUCCESS.String())
//			} else if payload.Args["status"] == "failed" {
//				response = payload.Args["message"]
//				logrus.WithFields(logFields).Error(fmt.Errorf("k8s resource discovery failed for error: %v", payload.Args["message"]))
//				callbackResponse = fmt.Sprintf("%s, status: %s", callbackResponse, protos.TaskStatus_FAILED.String())
//			}
//
//			var chaosDto protos.ChaosAccessDTO
//			chaosDto.ChaosAccessIdentifier = wrapperspb.String(payload.InfraId)
//			chaosDto.Data = wrapperspb.String(response)
//			chaosDto.Status = wrapperspb.String(payload.Args["status"])
//			byt, err := proto.Marshal(&chaosDto)
//			if err != nil {
//				logrus.WithFields(logFields).Error(fmt.Errorf("failed to marshal response: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			}
//
//			err = genericredis.GR.WriteHash(utils.Config.ChaosK8sTaskResponseRedisHash, payload.Args["requestId"], base64.StdEncoding.EncodeToString(byt))
//			if err != nil {
//				logrus.WithFields(logFields).Error(fmt.Errorf("failed to write response to redis: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			}
//
//		} else {
//			logrus.WithFields(logFields).Error(fmt.Errorf("failed to get k8s task status"))
//			http.Error(w, "k8s task status is empty", http.StatusBadRequest)
//			return
//		}
//
//	case protos.TaskType_K8S_LOG.String():
//		if payload.Args["status"] != "" {
//			if payload.Args["status"] == "success" {
//				callbackResponse = fmt.Sprintf("%s, status: %s", callbackResponse, protos.TaskStatus_SUCCESS.String())
//			} else if payload.Args["status"] == "failed" {
//				logrus.WithFields(logFields).WithError(fmt.Errorf(payload.Args["message"])).Error(fmt.Errorf("k8s log failed"))
//				callbackResponse = fmt.Sprintf("%s, status: %s", callbackResponse, protos.TaskStatus_FAILED.String())
//			}
//			var chaosDto protos.ChaosAccessDTO
//			chaosDto.ChaosAccessIdentifier = wrapperspb.String(payload.InfraId)
//			chaosDto.RequestType = wrapperspb.String("PodLog")
//			chaosDto.Data = wrapperspb.String(payload.Args["message"])
//
//			byt, err := proto.Marshal(&chaosDto)
//			if err != nil {
//				logrus.WithFields(logFields).Error(fmt.Errorf("failed to marshal response: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			}
//
//			err = genericredis.GR.WriteHash(utils.Config.ChaosK8sTaskResponseRedisHash, payload.Args["requestId"], base64.StdEncoding.EncodeToString(byt))
//			if err != nil {
//				logrus.WithFields(logFields).Println(fmt.Errorf("failed to write response to redis: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			}
//		} else {
//			logrus.WithFields(logFields).Error(fmt.Errorf("failed to get k8s log task status"))
//			http.Error(w, "k8s log task status is empty", http.StatusBadRequest)
//			return
//		}
//
//	case protos.TaskType_CREATE_WORKFLOW.String():
//		if payload.TaskStatus == protos.TaskStatus_TIMEOUT.String() || payload.Args["status"] == "failed" {
//			query := bson.D{
//				{"experiment_id", payload.Args["experimentID"]},
//				{"is_removed", false},
//			}
//			workflow, err := dbChaosExperiment.GetWorkflow(context.TODO(), query)
//			if err != nil {
//				logrus.WithFields(logFields).Error(fmt.Errorf("failed to get workflow: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			}
//
//			if workflow.CronSyntax != "" {
//				err = errors.New("cron experiment creation timed-out: " + payload.Args["experimentID"])
//				logrus.WithFields(logFields).Error(fmt.Errorf("failed to create cron workflow: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			} else {
//				var (
//					wc      = writeconcern.New(writeconcern.WMajority())
//					rc      = readconcern.Snapshot()
//					txnOpts = options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)
//				)
//				ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
//				defer cancel()
//
//				session, err := mongodb.MgoClient.StartSession()
//				if err != nil {
//					logrus.WithFields(logFields).Errorf("failed to start mongo session %v", err)
//					http.Error(w, err.Error(), http.StatusInternalServerError)
//					return
//				}
//
//				err = mongo.WithSession(context.Background(), session, func(sessionContext mongo.SessionContext) error {
//					if err = session.StartTransaction(txnOpts); err != nil {
//						logrus.WithFields(logFields).Errorf("failed to start mongo session transaction %v", err)
//						http.Error(w, err.Error(), http.StatusInternalServerError)
//						return err
//					}
//					filterQuery := bson.D{
//						{"experiment_id", payload.Args["experimentID"]},
//						{"recent_experiment_run_details.completed", false},
//						{"recent_experiment_run_details.notify_id", payload.Args["notifyID"]},
//					}
//					updateQuery := bson.D{
//						{
//							"$set", bson.D{
//								{"recent_experiment_run_details.$.phase", model.WorkflowRunStatusTimeout},
//								{"recent_experiment_run_details.$.updated_at", strconv.FormatInt(time.Now().Unix(), 10)},
//							},
//						},
//					}
//
//					if payload.Args["status"] == "failed" {
//						updateQuery = bson.D{
//							{
//								"$set", bson.D{
//									{"recent_experiment_run_details.$.phase", model.WorkflowRunStatusError},
//									{"recent_experiment_run_details.$.updated_at", strconv.FormatInt(time.Now().Unix(), 10)},
//								},
//							},
//						}
//					}
//
//					err = dbChaosExperiment.UpdateChaosWorkflow(sessionContext, filterQuery, updateQuery)
//					if err != nil {
//						logrus.WithFields(logFields).Error(fmt.Errorf("failed to update chaosExperiments collection: %w", err))
//						http.Error(w, err.Error(), http.StatusInternalServerError)
//						return err
//					}
//
//					query = bson.D{
//						{"notify_id", payload.Args["notifyID"]},
//						{"experiment_id", payload.Args["experimentID"]},
//						{"completed", false},
//					}
//
//					update := bson.D{
//						{"$set", bson.D{
//							{"phase", model.WorkflowRunStatusTimeout},
//						}}}
//
//					if payload.Args["status"] == "failed" {
//						update = bson.D{
//							{"$set", bson.D{
//								{"phase", model.WorkflowRunStatusError},
//							}}}
//					}
//
//					_, err := mongodb.Operator.Update(context.Background(), mongodb.ChaosExperimentRunsCollection, query, update)
//					if err != nil {
//						logrus.WithFields(logFields).Error(fmt.Errorf("failed to update chaos experiment run status: %w", err))
//						http.Error(w, err.Error(), http.StatusInternalServerError)
//						return err
//					}
//					if err = session.CommitTransaction(sessionContext); err != nil {
//						logrus.WithFields(logFields).Errorf("failed to commit session transaction %v", err)
//						http.Error(w, err.Error(), http.StatusInternalServerError)
//						return err
//					}
//					return nil
//				})
//
//				if err != nil {
//					if abortErr := session.AbortTransaction(ctx); abortErr != nil {
//						logrus.WithFields(logFields).Errorf("failed to abort session transaction %v", err)
//						http.Error(w, err.Error(), http.StatusInternalServerError)
//						return
//					}
//				}
//				session.EndSession(ctx)
//			}
//
//		}
//
//	case protos.TaskType_SUBSCRIBER_HEARTBEAT.String():
//		if payload.TaskStatus == protos.TaskStatus_TIMEOUT.String() {
//			query := bson.D{
//				{"infra_id", payload.InfraId},
//			}
//
//			update := bson.D{
//				{"$set", bson.D{
//					{"is_active", false},
//				}}}
//
//			_, err := mongodb.Operator.Update(context.Background(), mongodb.ChaosInfraCollection, query, update)
//			if err != nil {
//				logrus.WithFields(logFields).Error(fmt.Errorf("failed to update infrastructure status: %w", err))
//				http.Error(w, err.Error(), http.StatusInternalServerError)
//				return
//			}
//
//			return
//		}
//
//		var chaosDto protos.ChaosAccessDTO
//		chaosDto.ChaosAccessIdentifier = wrapperspb.String(payload.InfraId)
//		chaosDto.Data = wrapperspb.String("true")
//		byt, err := proto.Marshal(&chaosDto)
//		if err != nil {
//			logrus.WithFields(logFields).Error(fmt.Errorf("failed to marshal response: %w", err))
//			http.Error(w, err.Error(), http.StatusInternalServerError)
//			return
//		}
//
//		err = genericredis.GR.WriteHash(utils.Config.ChaosK8sTaskResponseRedisHash, payload.TaskID, base64.StdEncoding.EncodeToString(byt))
//		if err != nil {
//			logrus.WithFields(logFields).Errorf("failed to write to redis for heartbeat task response, error: %v", err)
//			logrus.WithFields(logFields).Error(fmt.Errorf("failed to update workflow run status: %w", err))
//			http.Error(w, err.Error(), http.StatusInternalServerError)
//		}
//	}
//
//	w.WriteHeader(http.StatusOK)
//	w.Write([]byte(callbackResponse))
//	return
//})
