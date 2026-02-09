// ==UserScript==
// @name         GeoFS GPWS Display Lite
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  GPWS警报显示（简洁版，Alt+D打开详细信息）
// @author       GPWS Display
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 等待页面加载完成
    setTimeout(function() {
        
        // ==================== 左上角警报显示容器 ====================
        const alertContainer = document.createElement('div');
        alertContainer.id = 'gpws-alerts-container';
        alertContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 999999;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 10px 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            min-width: 200px;
            max-width: 300px;
            box-shadow: 0 0 8px rgba(0,0,0,0.6);
            backdrop-filter: blur(3px);
            border: 1px solid rgba(255,255,255,0.15);
        `;
        
        // 警报标题
        const alertTitle = document.createElement('div');
        alertTitle.textContent = 'GPWS 警报';
        alertTitle.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            color: #00ff00;
            font-size: 13px;
        `;
        alertContainer.appendChild(alertTitle);
        
        // 警报列表容器
        const alertsList = document.createElement('div');
        alertsList.id = 'gpws-alerts-list';
        alertsList.innerHTML = '<div style="color: #888; font-style: italic; font-size: 11px;">无警报</div>';
        alertContainer.appendChild(alertsList);
        
        document.body.appendChild(alertContainer);
        
        // ==================== 详细信息窗口（默认隐藏） ====================
        let detailWindow = null;
        let isDetailWindowOpen = false;
        
        function createDetailWindow() {
            if (detailWindow && detailWindow.parentNode) {
                detailWindow.parentNode.removeChild(detailWindow);
            }
            
            detailWindow = document.createElement('div');
            detailWindow.id = 'gpws-detail-window';
            detailWindow.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000000;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                width: 350px;
                box-shadow: 0 0 20px rgba(0,0,0,0.8);
                border: 2px solid rgba(0, 150, 255, 0.5);
                display: none;
            `;
            
            // 窗口标题
            const windowTitle = document.createElement('div');
            windowTitle.textContent = 'GPWS 详细信息';
            windowTitle.style.cssText = `
                font-weight: bold;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(0, 150, 255, 0.5);
                color: #00aaff;
                font-size: 16px;
                text-align: center;
            `;
            detailWindow.appendChild(windowTitle);
            
            // 详细信息内容
            const detailContent = document.createElement('div');
            detailContent.id = 'gpws-detail-content';
            detailContent.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>离地高度:</span>
                    <span id="detail-agl">-- ft</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>垂直速率:</span>
                    <span id="detail-vs">-- ft/min</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>空速:</span>
                    <span id="detail-airspeed">-- kts</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>坡度:</span>
                    <span id="detail-bank">--°</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>自动驾驶:</span>
                    <span id="detail-autopilot">--</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>起落架:</span>
                    <span id="detail-gear">--</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>襟翼:</span>
                    <span id="detail-flaps">--</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>接地状态:</span>
                    <span id="detail-ground">--</span>
                </div>
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="color: #ff9900; margin-bottom: 5px;">当前飞机:</div>
                    <div id="detail-aircraft" style="font-size: 12px; color: #aaa;">--</div>
                </div>
            `;
            detailWindow.appendChild(detailContent);
            
            // 关闭按钮
            const closeButton = document.createElement('button');
            closeButton.textContent = '关闭 (ESC)';
            closeButton.style.cssText = `
                display: block;
                margin: 15px auto 0;
                background: rgba(255, 50, 50, 0.7);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 15px;
                cursor: pointer;
                font-size: 12px;
            `;
            closeButton.onclick = toggleDetailWindow;
            detailWindow.appendChild(closeButton);
            
            document.body.appendChild(detailWindow);
            
            // 点击窗口外部关闭
            detailWindow.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            document.addEventListener('click', function(e) {
                if (isDetailWindowOpen && !detailWindow.contains(e.target)) {
                    toggleDetailWindow();
                }
            });
            
            // ESC键关闭窗口
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isDetailWindowOpen) {
                    toggleDetailWindow();
                }
            });
        }
        
        function toggleDetailWindow() {
            if (!detailWindow) createDetailWindow();
            
            isDetailWindowOpen = !isDetailWindowOpen;
            detailWindow.style.display = isDetailWindowOpen ? 'block' : 'none';
            
            // 如果打开窗口，更新一次信息
            if (isDetailWindowOpen) {
                updateDetailInfo();
            }
        }
        
        // ==================== 警报系统 ====================
        let activeAlerts = [];
        const MAX_ALERTS_DISPLAY = 4;
        
        // 警报级别和颜色
        const ALERT_LEVELS = {
            CRITICAL: { color: '#ff0000', icon: '⚠️' },
            WARNING: { color: '#ff9900', icon: '⚠️' },
            CAUTION: { color: '#ffff00', icon: '⚠️' },
            INFO: { color: '#00ff00', icon: 'ℹ️' }
        };
        
        // 添加警报
        function addAlert(message, level = 'CAUTION') {
            // 避免重复警报
            if (activeAlerts.some(a => a.message === message)) {
                return;
            }
            
            const alertData = {
                message,
                level,
                time: new Date(),
                id: Date.now() + Math.random()
            };
            
            activeAlerts.unshift(alertData); // 新警报放在最前面
            
            // 限制显示数量
            if (activeAlerts.length > MAX_ALERTS_DISPLAY) {
                activeAlerts = activeAlerts.slice(0, MAX_ALERTS_DISPLAY);
            }
            
            updateAlertDisplay();
            
            // 关键警报闪烁效果
            if (level === 'CRITICAL') {
                flashAlert();
            }
        }
        
        // 移除警报
        function removeAlert(message) {
            const index = activeAlerts.findIndex(a => a.message === message);
            if (index !== -1) {
                activeAlerts.splice(index, 1);
                updateAlertDisplay();
            }
        }
        
        // 更新警报显示
        function updateAlertDisplay() {
            const container = document.getElementById('gpws-alerts-list');
            
            if (activeAlerts.length === 0) {
                container.innerHTML = '<div style="color: #888; font-style: italic; font-size: 11px;">无警报</div>';
                return;
            }
            
            container.innerHTML = '';
            activeAlerts.forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.style.cssText = `
                    margin: 4px 0;
                    padding: 4px 6px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 3px;
                    border-left: 2px solid ${ALERT_LEVELS[alert.level].color};
                    color: ${alert.level === 'CRITICAL' ? '#fff' : '#ddd'};
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                `;
                
                const time = alert.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                alertDiv.innerHTML = `
                    <span style="margin-right: 5px; font-size: 10px;">${ALERT_LEVELS[alert.level].icon}</span>
                    <span style="flex-grow: 1;">${alert.message}</span>
                    <span style="color: #888; font-size: 9px; margin-left: 5px;">${time}</span>
                `;
                container.appendChild(alertDiv);
            });
        }
        
        // 警报闪烁效果
        function flashAlert() {
            const container = document.getElementById('gpws-alerts-container');
            let flashCount = 0;
            const originalBorder = container.style.border;
            
            const flashInterval = setInterval(() => {
                container.style.border = flashCount % 2 === 0 ? 
                    '1px solid #ff0000' : 
                    '1px solid rgba(255,255,255,0.15)';
                flashCount++;
                if (flashCount >= 6) { // 闪烁3次
                    clearInterval(flashInterval);
                    container.style.border = originalBorder;
                }
            }, 200);
        }
        
        // 清除所有警报
        function clearAllAlerts() {
            activeAlerts = [];
            updateAlertDisplay();
        }
        
        // ==================== 飞行数据检查和更新 ====================
        function isInRange(current, target) {
            if (current >= 100) {
                return Math.abs(current - target) <= 10;
            } else if (current >= 10) {
                return Math.abs(current - target) <= 4;
            } else {
                return Math.abs(current - target) <= 1;
            }
        }
        
        function updateDetailInfo() {
            if (!geofs || !geofs.animation || !geofs.animation.values) return;
            
            try {
                // 基本飞行数据
                const agl = Math.round(
                    (geofs.animation.values.altitude - geofs.animation.values.groundElevationFeet) + 
                    (geofs.aircraft.instance.collisionPoints[geofs.aircraft.instance.collisionPoints.length - 2].worldPosition[2] * 3.2808399)
                );
                const verticalSpeed = Math.round(geofs.animation.values.verticalSpeed);
                const airspeed = Math.round(geofs.animation.values.airSpeed || 0);
                const bankAngle = Math.round(Math.abs(geofs.aircraft.instance.animationValue.aroll || 0));
                
                // 更新详细信息窗口
                if (detailWindow && isDetailWindowOpen) {
                    document.getElementById('detail-agl').textContent = `${agl} ft`;
                    document.getElementById('detail-vs').textContent = `${verticalSpeed} ft/min`;
                    document.getElementById('detail-airspeed').textContent = `${airspeed} kts`;
                    document.getElementById('detail-bank').textContent = `${bankAngle}°`;
                    document.getElementById('detail-autopilot').textContent = geofs.autopilot.on ? '开启' : '关闭';
                    document.getElementById('detail-gear').textContent = geofs.animation.values.gearPosition > 0.5 ? '放下' : '收起';
                    document.getElementById('detail-flaps').textContent = geofs.animation.values.flapsPosition > 0 ? '放下' : '收起';
                    document.getElementById('detail-ground').textContent = geofs.aircraft.instance.groundContact ? '接地' : '空中';
                    
                    // 飞机信息
                    const aircraftName = geofs.aircraft.instance.aircraftRecord?.name || '未知';
                    document.getElementById('detail-aircraft').textContent = aircraftName;
                }
                
                // 警报检查逻辑
                
                // 1. 高度警报
                const altitudeCheckpoints = [2500, 2000, 1000, 500, 400, 300, 200, 100, 50, 40, 30, 20, 10, 5];
                altitudeCheckpoints.forEach(checkpoint => {
                    if (isInRange(agl, checkpoint)) {
                        addAlert(`${checkpoint} 英尺`, 'INFO');
                    }
                });
                
                // 2. 失速警报
                if (geofs.aircraft.instance.stalling && !geofs.aircraft.instance.groundContact) {
                    addAlert('失速！失速！', 'CRITICAL');
                } else {
                    removeAlert('失速！失速！');
                }
                
                // 3. 坡度过大警报
                if (bankAngle > 45) {
                    addAlert('坡度过大！', 'WARNING');
                } else if (bankAngle > 30) {
                    addAlert('注意坡度', 'CAUTION');
                } else {
                    removeAlert('坡度过大！');
                    removeAlert('注意坡度');
                }
                
                // 4. 超速警报
                const maxSpeed = geofs.aircraft.instance.definition?.maxSpeed || 300;
                if (airspeed > maxSpeed * 1.05) {
                    addAlert('超速！', 'WARNING');
                } else {
                    removeAlert('超速！');
                }
                
                // 5. 太低 - 起落架
                if (!geofs.aircraft.instance.groundContact && agl < 300 && 
                    geofs.aircraft.instance.definition.gearTravelTime !== undefined && 
                    geofs.animation.values.gearPosition >= 0.5) {
                    addAlert('太低！起落架！', 'WARNING');
                } else {
                    removeAlert('太低！起落架！');
                }
                
                // 6. 太低 - 襟翼
                if (!geofs.aircraft.instance.groundContact && agl < 500 && 
                    geofs.animation.values.flapsSteps !== undefined && 
                    geofs.animation.values.flapsPosition === 0) {
                    addAlert('太低！襟翼！', 'WARNING');
                } else {
                    removeAlert('太低！襟翼！');
                }
                
                // 7. 下沉率过大
                if (!geofs.aircraft.instance.groundContact && agl < 300 && 
                    verticalSpeed < -1000) {
                    addAlert('下沉率过大！', 'CRITICAL');
                } else if (!geofs.aircraft.instance.groundContact && agl < 500 && 
                          verticalSpeed < -500) {
                    addAlert('注意下沉率', 'CAUTION');
                } else {
                    removeAlert('下沉率过大！');
                    removeAlert('注意下沉率');
                }
                
                // 8. 自动驾驶断开
                if (window.wasAPOn && !geofs.autopilot.on) {
                    addAlert('自动驾驶断开', 'INFO');
                    setTimeout(() => removeAlert('自动驾驶断开'), 3000);
                }
                window.wasAPOn = geofs.autopilot.on;
                
                // 9. 接地警报
                if (agl < 10 && !geofs.aircraft.instance.groundContact) {
                    addAlert('准备接地', 'INFO');
                    setTimeout(() => removeAlert('准备接地'), 3000);
                }
                
                // 10. 滑跑速度过高
                if (geofs.aircraft.instance.groundContact && airspeed > 80) {
                    addAlert('滑跑速度过高', 'CAUTION');
                } else {
                    removeAlert('滑跑速度过高');
                }
                
                // 自动清理过期警报（3秒）
                const now = new Date();
                activeAlerts = activeAlerts.filter(alert => {
                    return (now - alert.time) < 3000; // 保留3秒内的警报
                });
                
            } catch (error) {
                console.error('GPWS更新错误:', error);
            }
        }
        
        // ==================== 初始化和事件监听 ====================
        window.wasAPOn = false;
        createDetailWindow();
        
        // Alt+D 快捷键切换详细信息窗口
        document.addEventListener('keydown', function(event) {
            if (event.altKey && event.key === 'd') {
                event.preventDefault();
                toggleDetailWindow();
            }
        });
        
        // 设置定时更新（100ms更新一次）
        setInterval(updateDetailInfo, 100);
        
        // 初始更新
        updateDetailInfo();
        
        // 添加简洁的标题栏提示
        const titleTip = document.createElement('div');
        titleTip.textContent = '[Alt+D 查看详情]';
        titleTip.style.cssText = `
            position: absolute;
            top: -5px;
            right: 5px;
            color: #666;
            font-size: 9px;
        `;
        alertContainer.appendChild(titleTip);
        
    }, 8000); // 等待8秒确保GeoFS完全加载
    
})();
