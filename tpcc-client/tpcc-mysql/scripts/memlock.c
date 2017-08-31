#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/mman.h>

char *
alloc_workbuf(size_t size)
{
 char *ptr;

 /* allocate some memory */
 ptr = malloc(size);

 /* return NULL on failure */
 if (ptr == NULL)
  return NULL;

 /* lock this buffer into RAM */
 if (mlock(ptr, size)) {
  free(ptr);
  return NULL;
 }
 return ptr;
}

void 
free_workbuf(char *ptr, size_t size)
{
 /* unlock the address range */
 munlock(ptr, size);

 /* free the memory */
 free(ptr);
}

int main()
{

char *area;
size_t allocz=306535006208LLU;

area=alloc_workbuf(allocz);

while(1)
{
sleep(10);
} 

free_workbuf(area,allocz);

return 0;

}
