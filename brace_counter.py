import sys

def count_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    line = 1
    col = 1
    in_string = False
    string_char = None
    in_line_comment = False
    in_block_comment = False
    
    i = 0
    n = len(content)
    while i < n:
        c = content[i]
        
        # Track line/col
        if c == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        # Handle line comments
        if in_line_comment:
            if c == '\n':
                in_line_comment = False
            i += 1
            continue
            
        # Handle block comments
        if in_block_comment:
            if c == '/' and content[i-1] == '*':
                in_block_comment = False
            i += 1
            continue
            
        # Handle strings
        if in_string:
            if c == string_char and content[i-1] != '\\':
                in_string = False
            i += 1
            continue
            
        # Start of comments/strings
        if c == '/' and i + 1 < n and content[i+1] == '/':
            in_line_comment = True
            i += 2
            continue
        if c == '/' and i + 1 < n and content[i+1] == '*':
            in_block_comment = True
            i += 2
            continue
        if c in ['"', "'", '`']:
            in_string = True
            string_char = c
            i += 1
            continue
            
        # Braces
        if c == '{':
            stack.append((line, col))
        elif c == '}':
            if not stack:
                print(f"Unmatched closing brace '}}' at line {line}, col {col}")
                return False
            stack.pop()
            
        i += 1
        
    if stack:
        print(f"Unmatched opening braces:")
        for l, c in stack:
            print(f"  Opening brace '{{' at line {l}, col {c}")
        return False
        
    print("All braces are perfectly matched!")
    return True

if __name__ == '__main__':
    count_braces('app_v16_v2.js')
