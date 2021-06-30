package analytics

type STATE string

type PromDSDetails struct {
	URL   string
	Start string
	End   string
}

type PromQuery struct {
	Queryid    string
	Query      string
	Legend     *string
	Resolution *string
	Minstep    int
	DSdetails  *PromDSDetails
}

type PromSeries struct {
	Series    string
	DSdetails *PromDSDetails
}
