package analytics

// DataSource ...
type DataSource struct {
	DsID              string  `bson:"ds_id"`
	DsName            string  `bson:"ds_name"`
	DsType            string  `bson:"ds_type"`
	DsURL             string  `bson:"ds_url"`
	AccessType        string  `bson:"access_type"`
	AuthType          string  `bson:"auth_type"`
	BasicAuthUsername *string `bson:"basic_auth_username"`
	BasicAuthPassword *string `bson:"basic_auth_password"`
	ScrapeInterval    int     `bson:"scrape_interval"`
	QueryTimeout      int     `bson:"query_timeout"`
	HTTPMethod        string  `bson:"http_method"`
	CreatedAt         string  `bson:"created_at"`
	UpdatedAt         string  `bson:"updated_at"`
	ProjectID         string  `bson:"project_id"`
	IsRemoved         bool    `bson:"is_removed"`
}

// DashBoard ...
type DashBoard struct {
	DbID                      string                `bson:"db_id"`
	DsID                      string                `bson:"ds_id"`
	DbName                    string                `bson:"db_name"`
	DbTypeID                  string                `bson:"db_type_id"`
	DbTypeName                string                `bson:"db_type_name"`
	DbInformation             string                `bson:"db_information"`
	ChaosEventQueryTemplate   string                `bson:"chaos_event_query_template"`
	ChaosVerdictQueryTemplate string                `bson:"chaos_verdict_query_template"`
	ApplicationMetadataMap    []ApplicationMetadata `bson:"application_metadata_map"`
	CreatedAt                 string                `bson:"created_at"`
	UpdatedAt                 string                `bson:"updated_at"`
	ClusterID                 string                `bson:"cluster_id"`
	ProjectID                 string                `bson:"project_id"`
	EndTime                   string                `bson:"end_time"`
	StartTime                 string                `bson:"start_time"`
	RefreshRate               string                `bson:"refresh_rate"`
	PanelGroups               []PanelGroup          `bson:"panel_groups"`
	IsRemoved                 bool                  `bson:"is_removed"`
}

// ApplicationMetadata ...
type ApplicationMetadata struct {
	Namespace    string      `bson:"namespace"`
	Applications []*Resource `bson:"applications"`
}

// Resource ...
type Resource struct {
	Kind  string    `bson:"kind"`
	Names []*string `bson:"names"`
}

// PanelGroup ...
type PanelGroup struct {
	PanelGroupName string `bson:"panel_group_name"`
	PanelGroupID   string `bson:"panel_group_id"`
}

// Panel ...
type Panel struct {
	PanelID      string       `bson:"panel_id"`
	PanelOptions *PanelOption `bson:"panel_options"`
	PanelName    string       `bson:"panel_name"`
	PanelGroupID string       `bson:"panel_group_id"`
	PromQueries  []*PromQuery `bson:"prom_queries"`
	YAxisLeft    *string      `bson:"y_axis_left"`
	YAxisRight   *string      `bson:"y_axis_right"`
	XAxisDown    *string      `bson:"x_axis_down"`
	Unit         *string      `bson:"unit"`
	CreatedAt    string       `bson:"created_at"`
	UpdatedAt    string       `bson:"updated_at"`
	IsRemoved    bool         `bson:"is_removed"`
}

// PanelOption ...
type PanelOption struct {
	Points   *bool `bson:"points"`
	Grids    *bool `bson:"grids"`
	LeftAxis *bool `bson:"left_axis"`
}

// PromQuery ...
type PromQuery struct {
	Queryid       string  `bson:"queryid"`
	PromQueryName *string `bson:"prom_query_name"`
	Legend        *string `bson:"Legend"`
	Resolution    *string `bson:"resolution"`
	Minstep       *string `bson:"minstep"`
	Line          *bool   `bson:"line"`
	CloseArea     *bool   `bson:"close_area"`
}
