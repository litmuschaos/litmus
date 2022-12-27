package handler

// ChaosChart ...
type ChaosChart struct {
	APIVersion  string             `yaml:"apiVersion"`
	Kind        string             `yaml:"kind"`
	Metadata    Metadata           `yaml:"metadata"`
	Spec        Spec               `yaml:"spec"`
	PackageInfo PackageInformation `yaml:"packageInfo"`
}

// Maintainer ...
type Maintainer struct {
	Name  string
	Email string
}

// Link ...
type Link struct {
	Name string
	URL  string
}

// Metadata ...
type Metadata struct {
	Name        string     `yaml:"name"`
	Version     string     `yaml:"version"`
	Annotations Annotation `yaml:"annotations"`
}

// Annotation ...
type Annotation struct {
	Categories       string `yaml:"categories"`
	Vendor           string `yaml:"vendor"`
	CreatedAt        string `yaml:"createdAt"`
	Repository       string `yaml:"repository"`
	Support          string `yaml:"support"`
	ChartDescription string `yaml:"chartDescription"`
}

// Spec ...
type Spec struct {
	DisplayName         string       `yaml:"displayName"`
	CategoryDescription string       `yaml:"categoryDescription"`
	Keywords            []string     `yaml:"keywords"`
	Maturity            string       `yaml:"maturity"`
	Maintainers         []Maintainer `yaml:"maintainers"`
	MinKubeVersion      string       `yaml:"minKubeVersion"`
	Provider            struct {
		Name string `yaml:"name"`
	} `yaml:"provider"`
	Links           []Link   `yaml:"links"`
	Experiments     []string `yaml:"experiments"`
	ChaosExpCRDLink string   `yaml:"chaosexpcrdlink"`
	Platforms       []string `yaml:"platforms"`
	ChaosType       string   `yaml:"chaosType"`
}

// PackageInformation ...
type PackageInformation struct {
	PackageName string `yaml:"packageName"`
	Experiments []struct {
		Name string `yaml:"name"`
		CSV  string `yaml:"CSV"`
		Desc string `yaml:"desc"`
	} `yaml:"experiments"`
}
