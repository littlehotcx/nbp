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

package org.opensds.vmware.ngc.base;

public enum CapabilityUnitTypeEnum {

    /**
     * byte
     */
    Byte(1L),

    /**
     * KB
     */
    KB(1024L),

    /**
     * MB
     */
    MB(1024L * 1024L),

    /**
     * GB
     */
    GB(1024L * 1024L * 1024L),

    /**
     * TB
     */
    TB(1024L * 1024L * 1024L * 1024L),

    /**
     * PB
     */
    PB(1024L * 1024L * 1024L * 1024L * 1024L);

    private long scale;

    CapabilityUnitTypeEnum(long scale)
    {
        this.scale = scale;
    }


    public long getUnit()
    {
        return this.scale;
    }


    public static CapabilityUnitTypeEnum getCapabilityUnitTypeByorder(int order)
    {
        for (CapabilityUnitTypeEnum one : CapabilityUnitTypeEnum.values())
        {
            if (one.ordinal() == order)
            {
                return one;
            }
        }
        return CapabilityUnitTypeEnum.MB;
    }
}
