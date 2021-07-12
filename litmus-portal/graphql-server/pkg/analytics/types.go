package analytics

type STATE string

type PromQuery struct {
	Queryid    string
	Query      string
	Legend     *string
	Resolution *string
	Minstep    int
	DSdetails  *PromDSDetails
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
	Series    string
	DSdetails *PromDSDetails
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
	Values []*Option `json:"values"`
}

type Option struct {
	Name string `json:"name"`
}

type PromSeriesResponse struct {
	Series      string        `json:"series"`
	LabelValues []*LabelValue `json:"labelValues"`
}

//Portal Dashboard Types
type PortalDashboard struct {
	DashboardID               string `json:"dashboardID"`
	Name                      string `json:"name"`
	Information               string `json:"information"`
	ChaosEventQueryTemplate   string `json:"chaosEventQueryTemplate"`
	ChaosVerdictQueryTemplate string `json:"chaosVerdictQueryTemplate"`
	PanelGroupMap             []struct {
		GroupName string   `json:"groupName"`
		Panels    []string `json:"panels"`
	} `json:"panelGroupMap"`
	PanelGroups []struct {
		PanelGroupName string `json:"panel_group_name"`
		Panels         []struct {
			PanelName    string `json:"panel_name"`
			PanelOptions struct {
				Points   bool `json:"points"`
				Grids    bool `json:"grids"`
				LeftAxis bool `json:"left_axis"`
			} `json:"panel_options"`
			YAxisLeft   string `json:"y_axis_left"`
			YAxisRight  string `json:"y_axis_right"`
			XAxisDown   string `json:"x_axis_down"`
			Unit        string `json:"unit"`
			PromQueries []struct {
				PromQueryName string `json:"prom_query_name"`
				Legend        string `json:"legend"`
				Resolution    string `json:"resolution"`
				Minstep       string `json:"minstep"`
				Line          bool   `json:"line"`
				CloseArea     bool   `json:"close_area"`
			} `json:"prom_queries"`
		} `json:"panels"`
	} `json:"panelGroups"`
}
