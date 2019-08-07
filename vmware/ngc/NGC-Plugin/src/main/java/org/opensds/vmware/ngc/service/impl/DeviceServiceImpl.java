// Copyright 2019 The OpenSDS Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
package org.opensds.vmware.ngc.service.impl;

import org.opensds.vmware.ngc.models.StoragePoolMO;
import org.opensds.vmware.ngc.adapter.DeviceDataAdapter;
import org.opensds.vmware.ngc.dao.DeviceRepository;
import org.opensds.vmware.ngc.entity.ResultInfo;
import org.opensds.vmware.ngc.expections.ExpectionHandle;
import org.opensds.vmware.ngc.model.DeviceInfo;
import org.opensds.vmware.ngc.model.StoragePoolInfo;
import org.opensds.vmware.ngc.service.DeviceService;
import org.opensds.vmware.ngc.util.CapacityUtil;
import com.vmware.vise.vim.data.VimObjectReferenceService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.opensds.vmware.ngc.common.Storage;
import org.opensds.vmware.ngc.common.StorageFactory;
import org.opensds.vmware.ngc.models.POOL_TYPE;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
public class DeviceServiceImpl implements DeviceService {

    private static final Log logger = LogFactory.getLog(DeviceServiceImpl.class);

    @Autowired
    private VimObjectReferenceService vimObjectReferenceService;
    @Autowired
    private DeviceRepository deviceRepository;

    private static final String ERROR = "error";
    private static final String OK = "ok";


    @Override
    public ResultInfo<Object> add(DeviceInfo deviceInfo) {
        ResultInfo resultInfo = new ResultInfo();
        if (isContainDevice(deviceInfo)) {
            resultInfo.setMsg("The device " + deviceInfo.ip + " is already exist");
            resultInfo.setStatus(ERROR);
            logger.error("The device " + deviceInfo.ip + " is already exist");
            return resultInfo;
        }
        try {
            Object deviceReference = vimObjectReferenceService.getReference
                    (DeviceDataAdapter.DEVICE_TYPE, deviceInfo.ip, null);
            deviceInfo.setDeviceReference(deviceReference);
            String uid = vimObjectReferenceService.getUid(deviceReference);
            deviceInfo.id = uid;
            deviceInfo.name = deviceInfo.ip;
            deviceRepository.add(uid, deviceInfo);
            resultInfo.setData(deviceInfo);
            resultInfo.setStatus(OK);
        } catch (Exception e) {
            logger.error(e.getMessage(),e);
            resultInfo.setStatus(ERROR);
            resultInfo.setMsg(e.getMessage());
        }
        return resultInfo;
    }

    @Override
    public ResultInfo<Object> update(Object deviceReference, DeviceInfo deviceInfo) {
        ResultInfo resultInfo = new ResultInfo();
        try {
            String uid = vimObjectReferenceService.getUid(deviceReference);
            deviceRepository.update(uid, deviceInfo);
            resultInfo.setData(deviceInfo);
            resultInfo.setStatus(OK);
        } catch (Exception e) {
            logger.error(e.getMessage(),e);
            resultInfo.setStatus(ERROR);
            resultInfo.setMsg(e.getMessage());
        }
        return resultInfo;
    }

    @Override
    public ResultInfo<Object> delete(Object deviceReference) {
        ResultInfo resultInfo = new ResultInfo();
        try {
            String uid = vimObjectReferenceService.getUid(deviceReference);
            deviceRepository.remove(uid);
            resultInfo.setStatus(OK);
        } catch (Exception e) {
            logger.error(e.getMessage(),e);
            resultInfo.setStatus(ERROR);
            resultInfo.setMsg(e.getMessage());
        }
        return resultInfo;
    }

    @Override
    public ResultInfo<Object> get(Object deviceReference) {
        ResultInfo resultInfo = new ResultInfo();
        try {
            String uid = vimObjectReferenceService.getUid(deviceReference);
            DeviceInfo deviceInfo = deviceRepository.get(uid);
            resultInfo.setData(deviceInfo);
            resultInfo.setStatus(OK);
        } catch (Exception e) {
            logger.error(e.getMessage(),e);
            resultInfo.setStatus(ERROR);
            resultInfo.setMsg(e.getMessage());
        }
        return resultInfo;
    }

    @Override
    public ResultInfo<Object> getAllDeviceType() {
        ResultInfo resultInfo = new ResultInfo();
        try {
            List<DeviceType> deviceTypeList = new ArrayList<>();
            String[] types = StorageFactory.listStorages();
            for (String type : types) {
                String name = type.substring(type.lastIndexOf(".") + 1);
                DeviceType deviceType = new DeviceType(name, type);
                deviceTypeList.add(deviceType);
            }
            resultInfo.setData(deviceTypeList);
        } catch (Exception e) {
            logger.error(e.getMessage(),e);
            resultInfo.setMsg(e.getMessage());
            resultInfo.setStatus(ERROR);
        }
        return resultInfo;
    }

    @Override
    public ResultInfo<Object> getList() {
        ResultInfo resultInfo = new ResultInfo();
        resultInfo.setData(new ArrayList(deviceRepository.getAll().values()));
        return resultInfo;
    }

    @Override
    public ResultInfo<Object> getDeviceBlockPools(String deviceId) {
        ResultInfo resultInfo = new ResultInfo();
        List poolList = new ArrayList();
        DeviceInfo deviceInfo = null;
        try {
            deviceInfo = deviceRepository.get(deviceId);
            if (deviceInfo != null) {
                logger.info(String.format("DeviceInfo msg: %s!", deviceInfo.toString()));
                Storage device = deviceRepository.getLoginedDeviceByIP(deviceInfo.ip);
                for (StoragePoolMO poolMO: device.listStoragePools()) {
                    if (poolMO.type == POOL_TYPE.BLOCK) {
                        StoragePoolInfo poolInfo = convertPoolMoToCommon(poolMO);
                        poolList.add(poolInfo);
                    }
                }
            }
        } catch (Exception e) {
            //"This operation fails to be performed because of the unauthorized REST."
            try {
                if (e.getMessage().contains("unauthorized")) {
                    deviceRepository.update(deviceId, deviceInfo);
                    Storage device = deviceRepository.getLoginedDeviceByIP(deviceInfo.ip);
                    for (StoragePoolMO poolMO: device.listStoragePools()) {
                        if (poolMO.type == POOL_TYPE.BLOCK) {
                            StoragePoolInfo poolInfo = convertPoolMoToCommon(poolMO);
                            poolList.add(poolInfo);
                        }
                    }
                }
                else {
                    ExpectionHandle.handleExceptions(resultInfo, e);
                }
            } catch (Exception ex) {
                logger.error(String.format("Get error in relogin (%s)", ex.getMessage()));
                ExpectionHandle.handleExceptions(resultInfo, e);
            }
        }
        resultInfo.setData(poolList);
        return resultInfo;
    }

    private StoragePoolInfo convertPoolMoToCommon(final StoragePoolMO poolMO) {
        StoragePoolInfo poolInfo= new StoragePoolInfo();
        poolInfo.setName(poolMO.name)
                .setId(poolMO.id)
                .setUsageType(poolMO.type.name())
                .setTotalCapacity(CapacityUtil.convert512BToCap(poolMO.totalCapacity))
                .setFreeCapacity(CapacityUtil.convert512BToCap(poolMO.freeCapacity))
                .setAvailableCapacity(CapacityUtil.convert512BToCap(poolMO.totalCapacity - poolMO.freeCapacity));
        return poolInfo;
    }

    private boolean isContainDevice(DeviceInfo deviceInfo) {
        for (Map.Entry<String, DeviceInfo> entry : deviceRepository.getAll().entrySet()) {
            DeviceInfo existDevice = entry.getValue();
            if (existDevice.ip.equals(deviceInfo.ip)) {
                return true;
            }
        }
        return false;
    }

    private static class DeviceType {
        private String name;
        private String description;

        public DeviceType(String name, String description) {
            this.name = name;
            this.description = description;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
