package types

type STATE string

type Response struct {
	Queryid string              `json:"queryid"`
	Legends [][]*string         `json:"legends"`
	Tsvs    [][]*TimeStampValue `json:"tsvs"`
}

type TimeStampValue struct {
	Timestamp *string `json:"timestamp"`
	Value     *string `json:"value"`
}
