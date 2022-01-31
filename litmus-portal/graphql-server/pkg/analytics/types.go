package analytics

type STATE string

type PromDSDetails struct {
	URL   string
	Start string
	End   string
}

type PromQuery struct {
	QueryID    string
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
