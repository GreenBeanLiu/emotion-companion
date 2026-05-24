!include "nsProcess.nsh"

!macro EnsureAppClosed _PHASE
  ${nsProcess::FindProcess} "pulomi.exe" $R0
  ${If} $R0 == 0
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "检测到“pulomi”正在运行。安装程序需要先关闭它，点击“确定”后将尝试自动关闭；点击“取消”则退出本次${_PHASE}。" IDOK +2
    Abort

    ${nsProcess::CloseProcess} "pulomi.exe" $R1
    Sleep 1500
    ${nsProcess::FindProcess} "pulomi.exe" $R2
    ${If} $R2 == 0
      MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "“pulomi”仍在运行。请先手动关闭它，或在任务管理器中结束“pulomi.exe”进程后，再继续${_PHASE}。" IDOK retry IDCANCEL cancel
      retry:
        Abort
      cancel:
        Quit
    ${EndIf}
  ${EndIf}
!macroend

!macro customInit
  !insertmacro EnsureAppClosed "安装"
!macroend

!macro customUnInstallCheck
  !insertmacro EnsureAppClosed "卸载"
!macroend
