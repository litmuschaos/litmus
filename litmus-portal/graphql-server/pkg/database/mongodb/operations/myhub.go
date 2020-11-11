package operations

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var myhubCollection *mongo.Collection

func init() {
	myhubCollection = mongodb.Database.Collection("myhub")
}

//CreateMyHub ...
func CreateMyHub(ctx context.Context, myhub *dbSchema.MyHub) error {
	_, err := myhubCollection.InsertOne(ctx, myhub)
	if err != nil {
		log.Print("Error creating MyHub: ", err)
		return err
	}
	return nil
}

//GetMyHubByProjectID ...
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

//GetHubs ...
func GetHubs(ctx context.Context) ([]dbSchema.MyHub, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{}}
	cursor, err := myhubCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GETTING MYHUBS : ", err)
		return []dbSchema.MyHub{}, err
	}
	var MyHubs []dbSchema.MyHub
	err = cursor.All(ctx, &MyHubs)
	if err != nil {
		log.Print("Error deserializing myhubs in the myhub object : ", err)
		return []dbSchema.MyHub{}, err
	}
	return MyHubs, nil
}
