package rest_handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// GetIconHandler ...
var GetIconHandler = gin.HandlerFunc(func(c *gin.Context) {
	replacer := strings.NewReplacer("..", "", "../", "", "/", "", "\\", "")
	var (
		projectID          = replacer.Replace(c.Param("ProjectID"))
		hubName            = replacer.Replace(c.Param("HubName"))
		chartName          = replacer.Replace(c.Param("ChartName"))
		iconName           = replacer.Replace(c.Param("IconName"))
		img                *os.File
		err                error
		responseStatusCode = http.StatusOK
	)

	if strings.ToLower(chartName) == "predefined" {
		img, err = os.Open("/tmp/version/" + projectID + "/" + hubName + "/workflows/icons/" + iconName)
	} else {
		img, err = os.Open("/tmp/version/" + projectID + "/" + hubName + "/charts/" + chartName + "/icons/" + iconName)
	}

	if err != nil {
		responseStatusCode = http.StatusInternalServerError
		fmt.Fprint(c.Writer, "icon cannot be fetched, err : "+err.Error())
	}

	defer img.Close()

	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.WriteHeader(responseStatusCode)
	c.Writer.Header().Set("Content-Type", "image/png") // <-- set the content-type header
	io.Copy(c.Writer, img)
})
