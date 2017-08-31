import sys
import math
import functools

ins = open( sys.argv[1], "r" )
array = {}
response_times= {}

array_10s = {}
response_times_10s = {}

array_60s = {}
response_times_60s = {}

def calms(f_sec,f_ms,s_sec,s_ms):
	res=(int(f_sec)-int(s_sec))*1000 + (int(f_ms)-int(s_ms))/1000000
	return res

def percentile(N, percent, key=lambda x:x):
    """
    Find the percentile of a list of values.

    @parameter N - is a list of values. Note N MUST BE already sorted.
    @parameter percent - a float value from 0.0 to 1.0.
    @parameter key - optional key function to compute value from each element of N.

    @return - the percentile of the values
    """
    if not N:
        return None
    k = (len(N)-1) * percent
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return key(N[int(k)])
    d0 = key(N[int(f)]) * (c-k)
    d1 = key(N[int(c)]) * (k-f)
    return d0+d1

if len(sys.argv)>=2:
	pref=sys.argv[2]
else:
	pref=""

for line in ins:
	data=line.split()
	current_sec = int(data[3]);
	if array.has_key(current_sec):
		array[current_sec] = array[current_sec]+1
		response_times[current_sec].append(calms(data[3],data[4],data[6],data[7]))
	else:
		array[current_sec] = 1
		response_times[current_sec]=[calms(data[3],data[4],data[6],data[7])]
	cur_10s = current_sec/10
	if array_10s.has_key(cur_10s):
		array_10s[cur_10s] = array_10s[cur_10s]+1
		response_times_10s[cur_10s].append(calms(data[3],data[4],data[6],data[7]))
	else:
		array_10s[cur_10s] = 1
		response_times_10s[cur_10s]=[calms(data[3],data[4],data[6],data[7])]
		# print calms(data[3],data[4],data[6],data[7])
	cur_60s = current_sec/60
	if array_60s.has_key(cur_60s):
		array_60s[cur_60s] = array_60s[cur_60s]+1
		response_times_60s[cur_60s].append(calms(data[3],data[4],data[6],data[7]))
	else:
		array_60s[cur_60s] = 1
		response_times_60s[cur_60s]=[calms(data[3],data[4],data[6],data[7])]

minsec=min(array.keys())
maxsec=max(array.keys())
i=minsec
while i<=maxsec:
	if array.has_key(i):
		# print str(i),len(response_times[str(i)].sort())
		response_times[i].sort()
		pct99=percentile(response_times[i],0.99)
		print pref,i-minsec,array[i],pct99
	else:
		print pref,i-minsec,0
	i=i+1

print "========== 10 sec ============="

minsec=min(array_10s.keys())
maxsec=max(array_10s.keys())
i=minsec
while i<=maxsec:
	if array_10s.has_key(i):
		# print str(i),len(response_times[str(i)].sort())
		response_times_10s[i].sort()
		pct99=percentile(response_times_10s[i],0.99)
		print pref,i-minsec,array_10s[i],pct99
	else:
		print pref,i-minsec,0
	i=i+1

print "========== 60 sec ============="

minsec=min(array_60s.keys())
maxsec=max(array_60s.keys())
i=minsec
while i<=maxsec:
	if array_60s.has_key(i):
		# print str(i),len(response_times[str(i)].sort())
		response_times_60s[i].sort()
		pct99=percentile(response_times_60s[i],0.99)
		print pref,i-minsec,array_60s[i],pct99
	else:
		print pref,i-minsec,0
	i=i+1
