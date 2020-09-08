package invite

import (
	"bytes"
	"html/template"
	"log"
	"net/smtp"
	"os"
)

//MIME Header
const (
	MIME = "MIME-version: 1.0;\nContent-Type: text/HTML; charset=\"UTF-8\";\n\n"
)

//Request struct
type Request struct {
	from    string
	to      []string
	subject string
	body    string
}

//NewRequest creates a request
func NewRequest(to []string, subject string) *Request {
	return &Request{
		to:      to,
		subject: subject,
	}
}

//ParseTemplate parses template file and executes it with the template data supplied
func (r *Request) ParseTemplate(templateFileName string, data interface{}) error {
	t, err := template.ParseFiles(templateFileName)
	if err != nil {
		return err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, data); err != nil {
		return err
	}
	r.body = buf.String()
	return nil
}

//Sendmail parses the HTML template that is sent in the email body and calls SendEmail()
func Sendmail(recipients []string, username string, password string) {

	templateData := struct {
		Username string
		Password string
	}{
		Username: username,
		Password: password,
	}
	r := NewRequest(recipients, "Litmus Portal")
	if err := r.ParseTemplate("/home/saranyaj/MayaData/my work(active)/litmus/litmus-portal/backend/auth/pkg/utils/invite/templates/template.html", templateData); err == nil {

	r.SendEmail()
}

//SendEmail sends  invitation email
func (r *Request) SendEmail()  {
	from := os.Getenv("EMAIL_ID")
	body := "To: " + r.to[0] + "\r\nSubject: " + r.subject + "\r\n" + MIME + "\r\n" + r.body
	hostname := "smtp.gmail.com"

	auth := smtp.PlainAuth("", os.Getenv("GMAIL_USERNAME"), os.Getenv("GMAIL_PASSWORD"), hostname)

	if err := smtp.SendMail(hostname+":587", auth, from, r.to, []byte(body)); err != nil {
	
		log.Println(err)
	}
}
