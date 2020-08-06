package graph

import data_store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct{}

var store = data_store.New()
