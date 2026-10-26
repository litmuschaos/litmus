package utils

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"
)

type RestCallOption struct {
	maxRetries    int
	retryInterval time.Duration
	timeout       time.Duration
	headers       map[string]string
}

func WithMaxRetries(maxRetries int) func(*RestCallOption) {
	return func(opt *RestCallOption) {
		opt.maxRetries = maxRetries
	}
}

func WithRetryInterval(retryInterval time.Duration) func(*RestCallOption) {
	return func(opt *RestCallOption) {
		opt.retryInterval = retryInterval
	}
}

func WithHeaders(headers map[string]string) func(*RestCallOption) {
	return func(opt *RestCallOption) {
		opt.headers = headers
	}
}

func WithTimeout(timeout time.Duration) func(*RestCallOption) {
	return func(opt *RestCallOption) {
		opt.timeout = timeout
	}
}

func RestCall(method string, url string, payload []byte, opt ...func(option *RestCallOption)) (int, []byte, error) {
	// Initialize the options struct with default values
	rOpts := &RestCallOption{
		maxRetries:    5,
		retryInterval: 1 * time.Second,
		headers: map[string]string{
			"Content-Type": "application/json",
		},
	}

	// Override default values with user-provided options
	for _, o := range opt {
		o(rOpts)
	}

	// Initialize the HTTP client with the user-provided timeout, if provided
	client := &http.Client{}
	if rOpts.timeout > 0 {
		client.Timeout = rOpts.timeout
	}

	// Initialize the HTTP request
	req, err := http.NewRequest(method, url, bytes.NewBuffer(payload))
	if err != nil {
		return 0, nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Set the request headers
	for k, v := range rOpts.headers {
		req.Header.Set(k, v)
	}

	// Make the HTTP request with retries
	var resp *http.Response
	for i := 0; i < rOpts.maxRetries; i++ {
		resp, err = client.Do(req)
		if err == nil {
			break
		}
		time.Sleep(rOpts.retryInterval)
	}

	if err != nil {
		return 0, nil, fmt.Errorf("failed to send request after %d retries: %v", rOpts.maxRetries, err)
	}

	if resp == nil || resp.Body == nil {
		return 0, nil, fmt.Errorf("failed to send request after %d retries", rOpts.maxRetries)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, nil, fmt.Errorf("failed to read response body: %v", err)
	}

	defer resp.Body.Close()

	// Return the status code and response body
	return resp.StatusCode, body, nil
}
