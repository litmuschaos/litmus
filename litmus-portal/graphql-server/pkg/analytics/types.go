package analytics

type STATE string

type PromQuery struct {
	Queryid    string
	Query      string
	Legend     *string
	Resolution *string
	Minstep    int
	URL        string
	Start      string
	End        string
}

type Response struct {
	Queryid string              `json:"queryid"`
	Legends [][]*string         `json:"legends"`
	Tsvs    [][]*TimeStampValue `json:"tsvs"`
}

type TimeStampValue struct {
	Timestamp *string `json:"timestamp"`
	Value     *string `json:"value"`
}
