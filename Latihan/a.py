a = [2,5,3,4,1]
highest = a[0]
for i in range (1, len(a)):
    if a[i] > highest:
        highest = a[i]
print(highest)