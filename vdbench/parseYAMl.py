import yaml

#with open("input.yml", 'r') as stream:
 #   try:
  #      print(yaml.load(stream))
   # except yaml.YAMLError as exc:
    #    print(exc)


f=open("input.yml",'r')
dataMap=yaml.load(f)

print(dataMap['SDName'])

f.close()

