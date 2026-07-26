def check_braces_char_by_char(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    line = 1
    col = 1
    
    in_string = False
    string_char = None
    in_line_comment = False
    in_block_comment = False
    in_regex = False
    
    i = 0
    n = len(content)
    while i < n:
        c = content[i]
        
        # Track line/col
        next_line = line
        next_col = col + 1
        if c == '\n':
            next_line = line + 1
            next_col = 1
            
        if in_line_comment:
            if c == '\n':
                in_line_comment = False
            line, col = next_line, next_col
            i += 1
            continue
            
        if in_block_comment:
            if c == '/' and i > 0 and content[i-1] == '*':
                in_block_comment = False
            line, col = next_line, next_col
            i += 1
            continue
            
        if in_string:
            if c == string_char:
                # Check for escape
                escapes = 0
                k = i - 1
                while k >= 0 and content[k] == '\\':
                    escapes += 1
                    k -= 1
                if escapes % 2 == 0:
                    in_string = False
            line, col = next_line, next_col
            i += 1
            continue
            
        if in_regex:
            if c == '/':
                escapes = 0
                k = i - 1
                while k >= 0 and content[k] == '\\':
                    escapes += 1
                    k -= 1
                if escapes % 2 == 0:
                    in_regex = False
            elif c == '\n':
                # Regex cannot span newlines in JS, so it must be a division or syntax error
                in_regex = False
            line, col = next_line, next_col
            i += 1
            continue
            
        # Check start of comments
        if c == '/' and i + 1 < n and content[i+1] == '/':
            in_line_comment = True
            line, col = next_line, next_col
            i += 2
            continue
        if c == '/' and i + 1 < n and content[i+1] == '*':
            in_block_comment = True
            line, col = next_line, next_col
            i += 2
            continue
            
        # Check start of strings
        if c in ['"', "'", '`']:
            in_string = True
            string_char = c
            line, col = next_line, next_col
            i += 1
            continue
            
        # Check start of regex
        if c == '/':
            # In JS, a slash starts a regex if the previous non-whitespace token is operator or keyword
            # To be simple and robust: we can check if it looks like a regex /.../
            # If there is a closing / on the same line (not escaped), we can treat it as regex
            has_closing = False
            escaped = False
            for k in range(i + 1, n):
                if content[k] == '\n':
                    break
                if content[k] == '\\':
                    escaped = not escaped
                    continue
                if content[k] == '/' and not escaped:
                    has_closing = True
                    break
                escaped = False
            if has_closing:
                in_regex = True
                line, col = next_line, next_col
                i += 1
                continue
                
        # Braces
        if c == '{':
            stack.append((line, col))
        elif c == '}':
            if not stack:
                print(f"Unmatched '}}' at line {line}, col {col}")
                # Print the line content
                lines = content.split('\n')
                print(f"Line content: {lines[line-1]}")
                return
            stack.pop()
            
        line, col = next_line, next_col
        i += 1
        
    if stack:
        print("Unmatched '{' braces:")
        for line_num, col_num in stack[:10]:
            lines = content.split('\n')
            print(f"  Line {line_num}, col {col_num}: {lines[line_num - 1].strip()}")
    else:
        print("Braces are 100% matched!")

if __name__ == '__main__':
    check_braces_char_by_char('app_v16_v2.js')
