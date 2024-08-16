package database

import (
	"log"
	"os"

	"github.com/mongodb/mongo-tools/mongoexport"
	"github.com/mongodb/mongo-tools/mongoimport"
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
