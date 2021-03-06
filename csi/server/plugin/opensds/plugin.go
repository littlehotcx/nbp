// Copyright 2018 The OpenSDS Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package opensds

import (
	"github.com/golang/glog"
	"github.com/opensds/nbp/client/opensds"
	"github.com/opensds/nbp/csi/server/plugin"
	"github.com/opensds/opensds/client"
)

// Plugin define
type Plugin struct {
	PluginStorageType string
	Client            *client.Client
	VolumeClient      *Volume
	FileShareClient   *FileShare
}

func NewServer(endpoint, authStrategy, storageType string) (plugin.Service, error) {
	// get opensds client
	client, err := opensds.GetClient(endpoint, authStrategy)
	if client == nil || err != nil {
		glog.Errorf("get opensds client failed: %v", err)
		return nil, err
	}

	p := &Plugin{
		PluginStorageType: storageType,
		Client:            client,
		VolumeClient:      NewVolume(client),
		FileShareClient:   NewFileshare(client),
	}

	// When there are multiple volumes unmount at the same time,
	// it will cause conflicts related to the state machine,
	// so start a watch list to let the volumes unmount one by one.
	go p.UnpublishRoutine()

	return p, nil
}
