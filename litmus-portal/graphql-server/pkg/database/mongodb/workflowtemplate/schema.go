package workflowtemplate

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

type ManifestTemplate struct {
	TemplateID          string `bson:"template_id"`
	ProjectID           string `bson:"project_id"`
	Manifest            string `bson:"manifest"`
	TemplateName        string `bson:"template_name"`
	TemplateDescription string `bson:"template_description"`
	ProjectName         string `bson:"project_name"`
	CreatedAt           string `bson:"created_at"`
	IsRemoved           bool   `bson:"is_removed"`
	IsCustomWorkflow    bool   `bson:"is_custom_workflow"`
}

func (template ManifestTemplate) GetManifestTemplateOutput() *model.ManifestTemplate {
	return &model.ManifestTemplate{
		TemplateID:          template.TemplateID,
		TemplateName:        template.TemplateName,
		TemplateDescription: template.TemplateDescription,
		Manifest:            template.Manifest,
		ProjectName:         template.ProjectName,
		ProjectID:           template.ProjectID,
		CreatedAt:           template.CreatedAt,
		IsRemoved:           template.IsRemoved,
		IsCustomWorkflow:    template.IsCustomWorkflow,
	}
}
