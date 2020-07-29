package main

import (
	"encoding/json"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/agent/pkg/cluster"

	"flag"
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "0.0.0.0:8000", "http service address")

func main() {
	time.Sleep(5 * time.Second)
	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/"}
	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("err:", err)
				return
			}

			var unstructureData map[string]interface{}
			json.Unmarshal([]byte(message), &unstructureData)

			response, err := cluster.ClusterOperations(unstructureData)
			if err != nil {
				log.Println("err:", err)
			}

			responseData, err := json.Marshal(response)
			if err != nil {
				log.Println("err:", err)
			}

			c.WriteMessage(websocket.TextMessage, []byte(responseData))

		}
	}()

	for {
		select {
		case <-done:
			return
		case <-interrupt:
			log.Println("interrupt")

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}
