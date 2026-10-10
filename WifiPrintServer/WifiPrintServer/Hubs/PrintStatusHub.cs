using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WifiPrintServer.Hubs;

/// <summary>
/// Minimal SignalR hub for real-time print job status updates.
/// Clients connect at /ws/status with JWT in query string.
/// Each device joins a group by its deviceId to receive targeted updates.
/// </summary>
[Authorize]
public class PrintStatusHub : Hub
{
    public override Task OnConnectedAsync()
    {
        var deviceId = Context.User?.FindFirst("deviceId")?.Value;
        if (!string.IsNullOrEmpty(deviceId))
            Groups.AddToGroupAsync(Context.ConnectionId, deviceId);
        return base.OnConnectedAsync();
    }
}
