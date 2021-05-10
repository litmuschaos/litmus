package image_registry

type ImageRegistryType string

type ImageRegistry struct {
	ImageRegistryID   string            `bson:"image_registry_id"`
	ProjectID         string            `bson:"project_id"`
	ImageRegistryName string            `bson:"image_registry_name"`
	ImageRepoName     string            `bson:"image_repo_name"`
	ImageRegistryType ImageRegistryType `bson:"image_registry_type"`
	SecretName        *string           `bson:"secret_name"`
	SecretNamespace   *string           `bson:"secret_namespace"`
	EnableRegistry    *bool             `bson:"enable_registry"`
	UpdatedAt         string            `bson:"updated_at"`
	CreatedAt         *string           `bson:"created_at"`
	IsRemoved         bool              `bson:"isRemoved"`
}

const (
	ImageRegistryTypePublic  ImageRegistryType = "public"
	ImageRegistryTypePrivate ImageRegistryType = "private"
)

var AllImageRegistryType = []ImageRegistryType{
	ImageRegistryTypePublic,
	ImageRegistryTypePrivate,
}
