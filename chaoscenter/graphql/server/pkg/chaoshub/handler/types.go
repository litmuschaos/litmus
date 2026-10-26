package handler

type ChaosChart struct {
	APIVersion  string             `yaml:"apiVersion" json:"apiVersion"`
	Kind        string             `yaml:"kind" json:"kind"`
	Metadata    Metadata           `yaml:"metadata" json:"metadata"`
	Spec        Spec               `yaml:"spec" json:"spec"`
	PackageInfo PackageInformation `yaml:"packageInfo" json:"packageInfo"`
}

type Maintainer struct {
	Name  string `yaml:"name" json:"name"`
	Email string `yaml:"email" json:"email"`
}

type Link struct {
	Name string `yaml:"name" json:"name"`
	URL  string `yaml:"url" json:"url"`
}

type Faults struct {
	Name        string   `yaml:"name" json:"name"`
	DisplayName string   `json:"displayName" json:"displayName"`
	Description string   `yaml:"description" json:"description"`
	Plan        []string `json:"plan" json:"plan"`
}

type Metadata struct {
	Name        string     `yaml:"name" json:"name"`
	Version     string     `yaml:"version" json:"version,omitempty"`
	Annotations Annotation `yaml:"annotations" json:"annotations,omitempty"`
}

type Annotation struct {
	Categories       string `yaml:"categories" json:"categories"`
	Vendor           string `yaml:"vendor" json:"vendor"`
	CreatedAt        string `yaml:"createdAt" json:"createdAt"`
	Repository       string `yaml:"repository" json:"repository"`
	Support          string `yaml:"support" json:"support"`
	ChartDescription string `yaml:"chartDescription" json:"chartDescription"`
}

type Spec struct {
	DisplayName         string       `yaml:"displayName" json:"displayName"`
	CategoryDescription string       `yaml:"categoryDescription" json:"categoryDescription"`
	Plan                []string     `json:"plan" json:"plan"`
	Keywords            []string     `yaml:"keywords" json:"keywords"`
	Maturity            string       `yaml:"maturity" json:"maturity,omitempty"`
	Maintainers         []Maintainer `yaml:"maintainers" json:"maintainers,omitempty"`
	MinKubeVersion      string       `yaml:"minKubeVersion" json:"minKubeVersion,omitempty"`
	Scenarios           []string     `yaml:"scenarios" json:"scenarios"`
	Provider            struct {
		Name string `yaml:"name" json:"name"`
	} `yaml:"provider" json:"provider"`
	Links           []Link   `yaml:"links" json:"links,omitempty"`
	Experiments     []string `yaml:"experiments" json:"experiments"`
	Faults          []Faults `yaml:"faults" json:"faults"`
	ChaosExpCRDLink string   `yaml:"chaosexpcrdlink" json:"chaosexpcrdlink,omitempty"`
	Platforms       []string `yaml:"platforms" json:"platforms,omitempty"`
	ChaosType       string   `yaml:"chaosType" json:"chaosType,omitempty"`
}

type PackageInformation struct {
	PackageName string `yaml:"packageName" json:"packageName"`
	Experiments []struct {
		Name string `yaml:"name" json:"name"`
		CSV  string `yaml:"CSV" json:"CSV"`
		Desc string `yaml:"desc" json:"desc"`
	} `yaml:"experiments" json:"experiments"`
}

type ChaosCharts []ChaosChart

type ExecutionPlaneDetails struct {
	ExecutionPlane []struct {
		Name     string `yaml:"name"`
		Category []struct {
			Name string `yaml:"name"`
			CSV  string `yaml:"CSV"`
		} `yaml:"category"`
	} `yaml:"executionPlane"`
}
