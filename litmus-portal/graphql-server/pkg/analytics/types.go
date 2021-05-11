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

type MetricsResponse struct {
	Queryid string                     `json:"queryid"`
	Legends []*string                  `json:"legends"`
	Tsvs    [][]*MetricsTimeStampValue `json:"tsvs"`
}

type MetricsTimeStampValue struct {
	Date  *float64 `json:"date"`
	Value *float64 `json:"value"`
}

type AnnotationsResponse struct {
	Queryid string                         `json:"queryid"`
	Legends []*string                      `json:"legends"`
	Tsvs    [][]*AnnotationsTimeStampValue `json:"tsvs"`
}

type AnnotationsTimeStampValue struct {
	Date  *float64 `json:"date"`
	Value *int     `json:"value"`
}

type PromSeries struct {
	Series string
	URL    string
	Start  string
	End    string
}

type PromDSDetails struct {
	URL   string
	Start string
	End   string
}

type PromSeriesListResponse struct {
	SeriesList []*string `json:"seriesList"`
}

type LabelValue struct {
	Label  string    `json:"label"`
	Values []*string `json:"values"`
}

type PromSeriesResponse struct {
	Series      string        `json:"series"`
	LabelValues []*LabelValue `json:"labelValues"`
}
