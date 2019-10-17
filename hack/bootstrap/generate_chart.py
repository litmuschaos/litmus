from jinja2 import Environment, FileSystemLoader
import yaml
import os
import sys
import argparse

#TODO: No try-catch blocks have been used to account for empty/uninitialized attributes in attributes.yaml
#NOTE: Category attribute is expected to match with chart names(though not mandatory), as per convention followed in chaos-charts

def generate_csv(csv_parent_path, csv_name, csv_config, litmus_env):
    csv_filename = csv_parent_path + '/' + csv_name + '.' + 'chartserviceversion.yaml'

    #Load Jinja2 template
    template = litmus_env.get_template('./templates/chartserviceversion.yaml')
    output_from_parsed_template = template.render(csv_config)
    with open(csv_filename, "w+") as f:
        f.write(output_from_parsed_template)

def generate_package(package_parent_path, package_name):
    package_filename = package_parent_path + '/' + package_name + '.' + 'package.yaml'
    print(package_filename)
    with open(package_filename, "w+") as f:
        f.write('packageName: ' + package_name + '\n' + 'experiments:')

def generate_litmusbook(litmusbook_parent_path, litmusbook_name, litmus_env):
    
    k8s_job_filename = litmusbook_parent_path + '/' + litmusbook_name + '-' + 'k8s-job.yml'
    chaos_logic_filename = litmusbook_parent_path + '/' + litmusbook_name + '-' + 'ansible-logic.yml'
    chaos_prerequisites_filename = litmusbook_parent_path + '/' + litmusbook_name + '-' + 'ansible-prerequisites.yml'
    chaos_experiment_cr_filename = litmusbook_parent_path + '/' + litmusbook_name + '-' + 'experiment-cr.yml'
    
    k8s_job_template = litmus_env.get_template('./templates/experiment_k8s_job.yml')
    chaos_logic_template = litmus_env.get_template('./templates/experiment_ansible_logic.yml')
    chaos_prerequisites_template = litmus_env.get_template('./templates/experiment_ansible_prerequisites.yml')
    chaos_experiment_cr_template = litmus_env.get_template('./templates/experiment_custom_resource.yml')
    
    litmusbook_dict = {
            "job": [k8s_job_template, k8s_job_filename],
            "chaos_logic": [chaos_logic_template, chaos_logic_filename],
            "chaos_prerequisites": [chaos_prerequisites_template, chaos_prerequisites_filename],
            "chaos_experiment_cr": [chaos_experiment_cr_template, chaos_experiment_cr_filename]
    }
    
    chart_dir = litmusbook_parent_path.split("/")[-2]
    print(litmusbook_parent_path,chart_dir)

    for artifact in litmusbook_dict.values():
        output_from_parsed_template = artifact[0].render(name=litmusbook_name, chart=chart_dir)
        with open(artifact[1], "w+") as f:
            f.write(output_from_parsed_template)

def main():
    #Required Arg
    parser = argparse.ArgumentParser()
    parser.add_argument("-a", "--attributes_file", required=True, 
                        help="metadata to generate chartserviceversion yaml")
    parser.add_argument("-t", "--generate_type", required=True, 
                        help="scaffold a new chart or experiment into existing chart")
    #Optional Arg
    parser.add_argument("-c", "--chart_name", required=False,
                        help="existing chart name to which experiment belongs, defaults to 'category' in attributes file")

    args = parser.parse_args()

    entity_metadata_source = args.attributes_file
    entity_type = args.generate_type
    entity_parent = args.chart_name

    #Load data from YAML file into Python dictionary
    config = yaml.load(open(entity_metadata_source))
    entity_name = config['name']

    #Store the litmus root from bootstrap folder
    litmus_root = path = os.path.abspath(os.path.join("..", os.pardir))
    env = Environment(loader = FileSystemLoader('./'), trim_blocks=True, lstrip_blocks=True)

    if entity_type == 'chart':
        chart_dir = litmus_root + '/experiments/' + entity_name
        if os.path.isdir(chart_dir) != True:
            os.makedirs(chart_dir)
        generate_csv(chart_dir, entity_name, config, env) 
        generate_package(chart_dir, entity_name)

    elif entity_type == 'experiment':
        if entity_parent is None:
            experiment_category = config['category']
            chart_dir = litmus_root + '/experiments/' + experiment_category
        else:
            #Place experiment in the specified chart folder
            chart_dir = litmus_root + '/experiments/' + entity_parent
        if os.path.isdir(chart_dir) != True:
            os.makedirs(chart_dir)
            #Generate chart csv for the freshly created chart folder
            #Chart csv will not be generated in case chart folder already exists
            generate_csv(chart_dir, experiment_category, config, env)
            generate_package(chart_dir, experiment_category)

        experiment_dir = chart_dir + '/' + entity_name
        if os.path.isdir(experiment_dir) != True:
            os.makedirs(experiment_dir)

        generate_csv(experiment_dir, entity_name, config, env)
        generate_litmusbook(experiment_dir, entity_name, env)


if __name__=="__main__":
    main()
