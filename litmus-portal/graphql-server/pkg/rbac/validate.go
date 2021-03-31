package validate

import (
	"context"
	"errors"
	"fmt"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var projectCollection *mongo.Collection

func init() {
	projectCollection = mongodb.Database.Collection("project")
}

func ValidateRole(ctx context.Context, projectID string, requiredRole model.MemberRole) error {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	uid := claims["uid"].(string)
	fmt.Println("uid: ", uid)
	fmt.Println("projectID: ", projectID)
	fmt.Println("requiredRole: ", requiredRole)

	projection := bson.D{{"members", bson.D{{"$elemMatch", bson.D{{"user_id", uid}}}}}, {"_id", 0}}
	filter := bson.D{{"_id", projectID}}
	err := projectCollection.FindOne(ctx, filter, options.FindOne().SetProjection(projection))

	var role map[string][]model.Member
	err.Decode(&role)
	userRole := role["members"][0].Role
	fmt.Println("userRole: ", userRole)

	if userRole == requiredRole {
		return errors.New("Permission Denied")
	}

	return nil

	// query := bson.M{"members": bson.M{"$elemMatch": bson.M{"user_id": userID, "invitation": bson.M{"$ne": DeclinedInvitation}}}}
	// db.project.find({_id: pid},{members:{$elemMatch:{user_id:uid}},_id:0}).pretty()
	// query := bson.M{"_id": projectID, "members": bson.M{"$elemMatch": bson.M{"user_id": uid}}}
	// projection := bson.M{"_id": 0}
	// cursor, err := projectCollection.Find(ctx, query)

	// for cursor.Next(ctx) {
	// 	var result bson.D
	// 	err := cursor.Decode(&result)
	// 	if err != nil {
	// 		log.Fatal(err)
	// 	}
	// 	fmt.Println("reuslt: ", result)
	// }
	// err = cursor.All(ctx, &member)

	// err := projectCollection.FindOne(ctx, query)
	// cursor.Decode(&member)

	// x := role["members"]
	// fmt.Println("x:", x[0]["role"].(string))
	// Trying to access value of x:

	// val := reflect.ValueOf(x).Elem()
	// fmt.Println("value:", val)
	// n := val.FieldByName("role").Interface().(string)
	// fmt.Printf("%+v\n", n)

	// m, ok := x.(map[string]interface{})
	// fmt.Println("m:", m)
	// if !ok {
	// 	return fmt.Errorf("want type map[string]interface{};  got %T", x)
	// }
	// for k, v := range m {
	// 	fmt.Println(k, "=>", v)
	// }

	// s := reflect.ValueOf(x)
	// fmt.Println("s:", s)
	// for _, k := range s.MapKeys() {
	// 	fmt.Println("final role", s.MapIndex(k))
	// }
	// for i := 0; i < s.Len(); i++ {
	// 	fmt.Println(s.Index(i))
	// 	fmt.Println("roleee", s.Value(i))
	// }

	// for _, item := range role["members"].([]interface{}) {
	// 	fmt.Printf("%v", item.(map[string]interface{})["role"])
	// }

	// for key, value := range role {
	// 	fmt.Println("key from result2:", key, " || ", "value from result 2:", value)
	// 	if pa, ok := value.(primitive.A); ok {
	// 		valueMSI := []interface{}(pa)
	// 		fmt.Println("Working", valueMSI[0])
	// 		// for key, value := range valueMSI {
	// 		// 	fmt.Println("key from result3:", key, " || ", "value from result 3:", value)
	// 		// 	if ab, ok := value.(primitive.A); ok {
	// 		// 		valueMSG := []interface{}(ab)
	// 		// 		fmt.Println("Working", valueMSG[0])
	// 		// 	}
	// 		// }
	// 		fmt.Println(reflect.TypeOf(valueMSI))
	// 	}
	// }

	// fmt.Println("ROLEEEE ", role["members"].(map[string]interface{})["role"])

	// if err != nil {
	// 	fmt.Println("member: ", member.Role)

	// 	log.Print("Error getting user with userID: ", uid, " and projectID: ", projectID)
	// 	return nil
	// }

}
