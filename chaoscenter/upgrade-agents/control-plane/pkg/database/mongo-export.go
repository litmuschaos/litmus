package database

import (
	"log"
	"os"

	"github.com/mongodb/mongo-tools/mongoexport"
	"github.com/mongodb/mongo-tools/mongoimport"
	// "github.com/mongodb/mongo-tools/mongoimport"
)

func Export(filename string, RawArgs []string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	Options, err := mongoexport.ParseOptions(RawArgs, "", "")
	if err != nil {
		return err
	}
	MongoExport, err := mongoexport.New(Options)
	if err != nil {
		return err
	}
	defer MongoExport.Close()

	_, err = MongoExport.Export(file)
	if err != nil {
		return err
	}

	return nil
}

func Import(filename string, RawArgs []string) error {
	// client := db.GetDB() // Assuming db.GetDB() returns a *mongo.Client
	// testCollection := client.Database("post").Collection("test")

	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()

	// RawArgsTest := []string{
	// 	fmt.Sprintf("--uri=%s", db.GetDBURI()),
	// 	"--db=post",
	// 	"--collection=test",
	// 	fmt.Sprintf("--file=%s", filename),
	// 	"--jsonArray",
	// }

	Options, err := mongoimport.ParseOptions(RawArgs, "", "")
	if err != nil {
		return err
	}

	MongoImport, err := mongoimport.New(Options)
	if err != nil {
		return err
	}
	defer MongoImport.Close()

	// Import documents into 'test' collection
	success, failed, err := MongoImport.ImportDocuments()
	if err != nil {
		return err
	}
	if failed > 0 {
		log.Fatal("Could not import documents", success)
	}

	return nil
}
