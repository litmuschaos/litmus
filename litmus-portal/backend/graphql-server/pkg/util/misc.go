package util

import (
	"errors"
	"io/ioutil"
	"math/rand"
	"net/http"
)

func WriteHeaders(w *http.ResponseWriter, statusCode int) {
	(*w).Header().Set("Content-Type", "application/json; charset=utf-8")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).WriteHeader(statusCode)
}
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

func GetPublicIP() (string, error) {
	url := "https://api.ipify.org?format=text"
	resp, err := http.Get(url)
	if err != nil {
		return "", errors.New("ERROR : CANNOT GET PUBLIC IP " + err.Error())
	}
	defer resp.Body.Close()
	ip, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("ERROR : CANNOT GET PUBLIC IP " + err.Error())
	}
	return string(ip), nil
}
