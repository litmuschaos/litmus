/*
Copyright 2018 The OpenEBS Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package time

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestWaitFor(t *testing.T) {
	tests := []struct {
		name        string
		argDuration string
		wantSleep   time.Duration
		wantErr     bool
	}{
		{"nanosecond", "1ns", time.Nanosecond, false},
		{"microsecond", "1us", time.Microsecond, false},
		{"millisecond", "1ms", time.Millisecond, false},
		{"second", "1s", time.Second, false},
		{"minute", "1m", time.Minute, false},
		{"hour", "1h", time.Hour, false},
		{"negative", "-1s", -time.Second, false},
		{"fraction", "1.5s", 1500 * time.Millisecond, false},
		{"combo", "1h45m", 105 * time.Minute, false},
		{"error", "1a", 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var gotSleep time.Duration
			defer swapSleep(func(d time.Duration) { gotSleep = d })()

			err := WaitFor(tt.argDuration)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.wantSleep, gotSleep)
			}
		})
	}

	t.Run("real sleep is called", func(t *testing.T) {
		start := time.Now()
		err := WaitFor("100ms")
		require.NoError(t, err)
		require.Condition(t, func() bool { return time.Since(start) > 100*time.Millisecond })
	})
}

func swapSleep(newSleep func(time.Duration)) func() {
	oldSleep := sleep
	sleep = newSleep
	return func() { sleep = oldSleep }
}
