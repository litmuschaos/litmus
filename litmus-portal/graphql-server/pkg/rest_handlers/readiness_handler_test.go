package rest_handlers_test

import (
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestReadinessHandler(t *testing.T) {
	// given
	var (
		readinessStatus rest_handlers.ReadinessAPIStatus
		w               *httptest.ResponseRecorder
		ctx             *gin.Context
	)
	mongoClient := &mongo.Client{}
	mongoOperator := new(mocks.MongoOperator)
	testcases := []struct {
		name  string
		given func()
		want  rest_handlers.ReadinessAPIStatus
	}{
		{
			name: "success",
			given: func() {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				mongoOperator.On("ListDataBase", mock.Anything, mongoClient).Return([]string{"litmus"}, nil).Once()
				mongoOperator.On("ListCollection", mock.Anything, mongoClient).Return([]string{"gitops-collection", "server-config-collection", "workflow-collection"}, nil).Once()
			},
			want: rest_handlers.ReadinessAPIStatus{
				DataBase:    "up",
				Collections: "up",
			},
		},
		{
			name: "failure: mongo list database error",
			given: func() {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				mongoOperator.On("ListDataBase", mock.Anything, mongoClient).Return([]string{}, errors.New("")).Once()
				mongoOperator.On("ListCollection", mock.Anything, mongoClient).Return([]string{"gitops-collection", "server-config-collection", "workflow-collection"}, nil).Once()
			},
			want: rest_handlers.ReadinessAPIStatus{
				DataBase:    "down",
				Collections: "up",
			},
		},
		{
			name: "failure: cannot find litmus database",
			given: func() {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				mongoOperator.On("ListDataBase", mock.Anything, mongoClient).Return([]string{}, nil).Once()
				mongoOperator.On("ListCollection", mock.Anything, mongoClient).Return([]string{"gitops-collection", "server-config-collection", "workflow-collection"}, nil).Once()
			},
			want: rest_handlers.ReadinessAPIStatus{
				DataBase:    "down",
				Collections: "up",
			},
		},
		{
			name: "failure: mongo list collection error",
			given: func() {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				mongoOperator.On("ListDataBase", mock.Anything, mongoClient).Return([]string{"litmus"}, nil).Once()
				mongoOperator.On("ListCollection", mock.Anything, mongoClient).Return([]string{}, errors.New("")).Once()
			},
			want: rest_handlers.ReadinessAPIStatus{
				DataBase:    "up",
				Collections: "down",
			},
		},
		{
			name: "failure: cannot find gitops collection",
			given: func() {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				mongoOperator.On("ListDataBase", mock.Anything, mongoClient).Return([]string{"litmus"}, nil).Once()
				mongoOperator.On("ListCollection", mock.Anything, mongoClient).Return([]string{"server-config-collection", "workflow-collection"}, nil).Once()
			},
			want: rest_handlers.ReadinessAPIStatus{
				DataBase:    "up",
				Collections: "down",
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			handler := rest_handlers.ReadinessHandler(mongoClient, mongoOperator)
			handler(ctx)

			// then
			err := json.Unmarshal(w.Body.Bytes(), &readinessStatus)
			assert.NoError(t, err)
			assert.Equal(t, tc.want.DataBase, readinessStatus.DataBase)
			assert.Equal(t, tc.want.Collections, readinessStatus.Collections)
			assert.Equal(t, 200, w.Code)
		})
	}
}
