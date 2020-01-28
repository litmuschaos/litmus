import pytest
import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape
import filecmp

@pytest.fixture
def jinja_template_dir():
    j_path = './templates/'
    return j_path

@pytest.fixture
def config_content():
    c_path = 'attributes.yaml.sample'
    config = yaml.safe_load(open(c_path))
    return config

@pytest.fixture
def expected_file_dir():
    e_path = './test/templates/'
    return e_path

def text_banner(template_file, expected_file):
    banner_text = "\n\n### TestInputs ###\n\nTemplate: %s\nExpectedFile: %s\n" %(
            template_file, expected_file)
    print(banner_text)

def verify_generated_artifact(template_file, config_file, expected_file):
    env = Environment(loader = FileSystemLoader('./'), trim_blocks=True, lstrip_blocks=True, autoescape=select_autoescape(['yaml']))
    tmpl = env.get_template(template_file)
    output_from_parsed_template = tmpl.render(config_file)
    with open('test_generated_artifact.yml', "w+") as f:
        f.write(output_from_parsed_template)
    comparison_result = filecmp.cmp('test_generated_artifact.yml', expected_file)
    return comparison_result

def test_generate_csv(jinja_template_dir, config_content, expected_file_dir):
    artifact_tmpl = jinja_template_dir + 'chartserviceversion.tmpl'
    artifact_actual = expected_file_dir + 'chartserviceversion.expected'
    text_banner(artifact_tmpl, artifact_actual)
    result = verify_generated_artifact(artifact_tmpl, config_content, artifact_actual)
    assert result
   
def test_generate_package(jinja_template_dir, config_content, expected_file_dir):
    artifact_tmpl = jinja_template_dir + 'package.tmpl'
    artifact_actual = expected_file_dir + 'package.expected'
    text_banner(artifact_tmpl, artifact_actual)
    result = verify_generated_artifact(artifact_tmpl, config_content, artifact_actual)
    assert result

def test_generate_litmusbook(jinja_template_dir, config_content, expected_file_dir):
    litmusbook_dict = {
            "experiment_cr": ['experiment_custom_resource.tmpl', 'experiment_cr.expected'],
            "experiment_logic": ['experiment_ansible_logic.tmpl', 'experiment_logic.expected']
    }

    for every_value in litmusbook_dict.values():
        artifact_tmpl = jinja_template_dir + every_value[0]
        artifact_actual = expected_file_dir + every_value[1]
        text_banner(artifact_tmpl, artifact_actual)
        result = verify_generated_artifact(artifact_tmpl, config_content, artifact_actual)
        assert result