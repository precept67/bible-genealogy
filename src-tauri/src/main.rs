#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

#[tauri::command]
fn toggle_app_fullscreen(window: tauri::Window) -> Result<bool, String> {
  let is_full = window.is_fullscreen().map_err(|e| e.to_string())?;
  window.set_fullscreen(!is_full).map_err(|e| e.to_string())?;
  Ok(!is_full)
}

fn main() {
  let toggle_edit = CustomMenuItem::new("toggle_edit".to_string(), "편집 모드 전환").accelerator("CmdOrCtrl+Shift+E");

  let app_menu = Submenu::new("열린 족보이야기", Menu::new()
    .add_native_item(MenuItem::About("열린 족보이야기".to_string(), Default::default()))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("open_settings".to_string(), "환경설정...").accelerator("CmdOrCtrl+,"))
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Hide)
    .add_native_item(MenuItem::HideOthers)
    .add_native_item(MenuItem::ShowAll)
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Quit));

  let file_menu = Submenu::new("파일", Menu::new()
    .add_item(CustomMenuItem::new("open_settings".to_string(), "환경설정...").accelerator("CmdOrCtrl+,"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("icloud_sync".to_string(), "☁️ iCloud 실시간 동기화").accelerator("CmdOrCtrl+Shift+S"))
    .add_item(CustomMenuItem::new("icloud_export".to_string(), "iCloud로 전체 데이터 백업 / 내보내기"))
    .add_item(CustomMenuItem::new("icloud_import".to_string(), "iCloud에서 최신 데이터 가져오기"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("export_notes".to_string(), "연구 메모 백업"))
    .add_item(CustomMenuItem::new("import_notes".to_string(), "연구 메모 복원")));

  let edit_menu = Submenu::new("편집", Menu::new()
    .add_item(toggle_edit)
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("add_person".to_string(), "인물 추가").accelerator("Alt+P"))
    .add_item(CustomMenuItem::new("add_event".to_string(), "사건 추가").accelerator("Alt+E"))
    .add_item(CustomMenuItem::new("add_location".to_string(), "장소/지명 추가").accelerator("Alt+L"))
    .add_item(CustomMenuItem::new("add_note".to_string(), "메모 상자 추가").accelerator("Alt+N"))
    .add_item(CustomMenuItem::new("add_polygon".to_string(), "영역 추가").accelerator("Alt+G"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("copy_box".to_string(), "복사").accelerator("CmdOrCtrl+C"))
    .add_item(CustomMenuItem::new("paste_box".to_string(), "붙여넣기").accelerator("CmdOrCtrl+V"))
    .add_item(CustomMenuItem::new("duplicate_box".to_string(), "박스 즉시 복제").accelerator("CmdOrCtrl+D"))
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Undo)
    .add_native_item(MenuItem::Redo)
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Cut)
    .add_native_item(MenuItem::SelectAll));

  let view_menu = Submenu::new("보기", Menu::new()
    .add_item(CustomMenuItem::new("zoom_in".to_string(), "확대").accelerator("CmdOrCtrl+="))
    .add_item(CustomMenuItem::new("zoom_out".to_string(), "축소").accelerator("CmdOrCtrl+-"))
    .add_item(CustomMenuItem::new("reset_zoom".to_string(), "100% 기본 크기").accelerator("CmdOrCtrl+0"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("center_adam".to_string(), "시작 위치(아담)로 이동").accelerator("Alt+A"))
    .add_item(CustomMenuItem::new("theme_toggle".to_string(), "다크 모드").accelerator("Alt+T"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("toggle_fullscreen".to_string(), "전체 화면").accelerator("CmdOrCtrl+Ctrl+F")));

  let help_menu = Submenu::new("도움말", Menu::new()
    .add_item(CustomMenuItem::new("manual".to_string(), "사용 가이드"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("about_app".to_string(), "열린 족보이야기 정보")));

  let menu = Menu::new()
    .add_submenu(app_menu)
    .add_submenu(file_menu)
    .add_submenu(edit_menu)
    .add_submenu(view_menu)
    .add_submenu(help_menu);

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![toggle_app_fullscreen])
    .menu(menu)
    .on_menu_event(|event| {
      match event.menu_item_id() {
        "toggle_fullscreen" => {
          let is_full = event.window().is_fullscreen().unwrap_or(false);
          let _ = event.window().set_fullscreen(!is_full);
        }
        "toggle_edit" => {
          let _ = event.window().emit("toggle-edit-mode", ());
        }
        "open_settings" => {
          let _ = event.window().emit("open-settings", ());
        }
        "icloud_sync" => {
          let _ = event.window().emit("menu-icloud-sync", ());
        }
        "icloud_export" => {
          let _ = event.window().emit("menu-icloud-export", ());
        }
        "icloud_import" => {
          let _ = event.window().emit("menu-icloud-import", ());
        }
        "export_notes" => {
          let _ = event.window().emit("menu-export-notes", ());
        }
        "import_notes" => {
          let _ = event.window().emit("menu-import-notes", ());
        }
        "copy_box" => {
          let _ = event.window().emit("menu-copy-box", ());
        }
        "paste_box" => {
          let _ = event.window().emit("menu-paste-box", ());
        }
        "duplicate_box" => {
          let _ = event.window().emit("menu-duplicate-box", ());
        }
        "add_person" => {
          let _ = event.window().emit("menu-add-person", ());
        }
        "add_event" => {
          let _ = event.window().emit("menu-add-event", ());
        }
        "add_location" => {
          let _ = event.window().emit("menu-add-location", ());
        }
        "add_note" => {
          let _ = event.window().emit("menu-add-note", ());
        }
        "add_polygon" => {
          let _ = event.window().emit("menu-add-polygon", ());
        }
        "zoom_in" => {
          let _ = event.window().emit("menu-zoom-in", ());
        }
        "zoom_out" => {
          let _ = event.window().emit("menu-zoom-out", ());
        }
        "reset_zoom" => {
          let _ = event.window().emit("menu-reset-zoom", ());
        }
        "center_adam" => {
          let _ = event.window().emit("menu-center-adam", ());
        }
        "theme_toggle" => {
          let _ = event.window().emit("menu-theme-toggle", ());
        }
        "manual" => {
          let _ = event.window().emit("menu-manual", ());
        }
        "about_app" => {
          let _ = event.window().emit("menu-about-app", ());
        }
        _ => {}
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
