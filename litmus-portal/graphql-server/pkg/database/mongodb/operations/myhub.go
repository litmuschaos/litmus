package operations

import (
	"context"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
)

var myhubCollection *mongo.Collection

func init() {
	myhubCollection = mongodb.Database.Collection("myhub")
}

func CreateMyHub(ctx context.Context, myhub *dbSchema.MyHub) error {
	_, err := myhubCollection.InsertOne(ctx, myhub)
	if err != nil {
		log.Print("Error creating MyHub: ", err)
		return err
	}
	return nil
}

func GetMyHubByProjectID(ctx context.Context, projectID string) ([]dbSchema.MyHub, error) {
	query := bson.M{"project_id": projectID}
	cursor, err := myhubCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING USERS : ", err)
		return []dbSchema.MyHub{}, err
	}
	var myhubs []dbSchema.MyHub
	err = cursor.All(ctx, &myhubs)
	if err != nil {
		log.Print("Error deserializing myhubs in myhub object : ", err)
		return []dbSchema.MyHub{}, err
	}
	return myhubs, nil
}
