package gitops

import (
	"regexp"
	"strings"
	"sync"

	log "github.com/sirupsen/logrus"
)

// GitMutexLock structure for the Git MutexLock
type GitMutexLock struct {
	mapMutex sync.Mutex
	gitMutex map[string]*sync.Mutex
}

// Lock acquires a lock on particular project or repo for access
func (g *GitMutexLock) Lock(repo string, branch *string) {
	key := getKey(repo, branch)

	g.mapMutex.Lock()
	if _, ok := g.gitMutex[key]; !ok {
		g.gitMutex[key] = &sync.Mutex{}
	}
	temp := g.gitMutex[key]
	g.mapMutex.Unlock()

	temp.Lock()
	log.Info("acquired LOCK : ", key)
}

// Unlock releases the lock on particular project or repo
func (g *GitMutexLock) Unlock(repo string, branch *string) {
	key := getKey(repo, branch)
	g.mapMutex.Lock()
	if _, ok := g.gitMutex[key]; !ok {
		return
	}
	temp := g.gitMutex[key]
	g.mapMutex.Unlock()
	temp.Unlock()
	log.Info("release LOCK : ", key)
}

// NewGitLock returns a instance of GitMutexLock
func NewGitLock() GitMutexLock {
	return GitMutexLock{
		mapMutex: sync.Mutex{},
		gitMutex: map[string]*sync.Mutex{},
	}
}

func getKey(repo string, branch *string) string {
	if branch == nil {
		return repo
	}
	key := strings.Trim(repo, ".git")
	split := regexp.MustCompile(`[:/]`).Split(key, -1)
	return strings.Join(split[len(split)-2:], "/") + "/" + *branch
}
