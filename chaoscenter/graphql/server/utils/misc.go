package utils

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"math/rand"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/harness/hce-saas/graphql/server/graph/model"

	"github.com/google/uuid"
)

const GRPCErrorPrefix string = "rpc error: code = Unknown desc ="

// WriteHeaders adds important headers to API responses
func WriteHeaders(w *http.ResponseWriter, statusCode int) {
	(*w).Header().Set("Content-Type", "application/json; charset=utf-8")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).WriteHeader(statusCode)
}

// RandomString generates random strings, can be used to create ids or random secrets
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
	rand.Seed(time.Now().UnixNano())
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}

	return string(s)
}

func AddRootIndent(b []byte, n int) []byte {
	prefix := append([]byte("\n"), bytes.Repeat([]byte(" "), n)...)
	return bytes.ReplaceAll(b, []byte("\n"), prefix)
}

// ContainsString checks if a string is present in an array of strings
func ContainsString(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}

func MatchInfrastructureType(infras []*model.InfrastructureType, infra model.InfrastructureType) bool {
	for _, v := range infras {
		if v == nil {
			continue
		}
		if *v == infra {
			return true
		}
	}

	return false
}

// Truncate a float to two levels of precision
func Truncate(num float64) float64 {
	return float64(int(num*100)) / 100
}

// Split returns the string in between a before sub-string and an after sub-string
func Split(str, before, after string) string {
	a := strings.SplitAfterN(str, before, 2)
	b := strings.SplitAfterN(a[len(a)-1], after, 2)
	if 1 == len(b) {
		return b[0]
	}
	return b[0][0 : len(b[0])-len(after)]
}

// GenerateUuid : Generate a unique string id based on google/uuid
func GenerateUuid() string {
	id := uuid.New()
	return base64.RawURLEncoding.EncodeToString(id[:])
}

// DecryptToken is used to decrypt a token with a key
func DecryptToken(encryptedString string, keyString string) (decryptedString string) {
	block, err := aes.NewCipher([]byte(keyString))
	if err != nil {
		return ""
	}

	cipherText, err := decode(encryptedString)
	if err != nil {
		return ""
	}

	var randBytes = []byte{50, 30, 90, 24, 44, 67, 24, 80, 82, 14, 50, 63, 46, 32, 14, 05}

	cfb := cipher.NewCFBDecrypter(block, randBytes)

	plainText := make([]byte, len(cipherText))

	cfb.XORKeyStream(plainText, cipherText)

	return string(plainText)
}

func decode(s string) ([]byte, error) {
	data, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		return nil, err
	}
	return data, err
}

func CheckEmptyFields(v interface{}) error {
	val := reflect.ValueOf(v).Elem()
	for i := 0; i < val.NumField(); i++ {
		valueField := val.Field(i)
		typeField := val.Type().Field(i)
		if valueField.Kind() == reflect.String && valueField.String() == "" && valueField.Type().Kind() != reflect.Ptr {
			return fmt.Errorf("%s is empty\n", typeField.Name)
		}
	}

	return nil
}

func StringPtrToString(val *string) string {
	if val != nil {
		return *val
	}
	return ""
}

func ParseGRPCError(err error) error {
	if strings.HasPrefix(err.Error(), GRPCErrorPrefix) {
		grpcErr := strings.TrimPrefix(err.Error(), GRPCErrorPrefix)
		return fmt.Errorf(grpcErr)
	}
	return err
}

func GetInfraType(t *model.InfrastructureType) model.InfrastructureType {
	if t == nil {
		return model.InfrastructureTypeAll
	}
	return *t
}
