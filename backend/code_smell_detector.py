import ast
import json
import sys
from collections import Counter
import re

class CodeSmellDetector:
    def __init__(self, enabled_smells):
        self.smells = enabled_smells

    def camel_to_snake(self, name):
        """Convert camelCase to snake_case"""
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

    def detect_long_method(self, tree, file_path, report):
        try:
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # SIMPLIFIED and ACCURATE statement counting
                    statement_count = 0
                    
                    def count_statements(node_list):
                        count = 0
                        for item in node_list:
                            if isinstance(item, (ast.Assign, ast.Return, ast.Expr, ast.AugAssign)):
                                count += 1
                            elif isinstance(item, ast.For):
                                count += 1  # The for statement itself
                                count += count_statements(item.body)  # Count body statements
                            elif isinstance(item, ast.If):
                                count += 1  # The if statement itself
                                count += count_statements(item.body)  # Count if body
                                count += count_statements(item.orelse)  # Count else body
                        return count
                    
                    statement_count = count_statements(node.body)
                    
                    # Debug output
                    print(f"DEBUG: Function {node.name} at line {node.lineno} has {statement_count} statements", file=sys.stderr)
                    
                    if statement_count > 5:  # Lower threshold
                        report['LongMethod'].append({
                            'file': file_path,
                            'lineStart': node.lineno,
                            'lineEnd': node.end_lineno or node.lineno,
                            'message': f"Function '{node.name}' has {statement_count} statements.",
                            'snippet': ast.unparse(node) if hasattr(ast, 'unparse') else node.name
                        })
        except Exception as e:
            print(f"Error in detect_long_method for {file_path}: {e}", file=sys.stderr)

    def detect_god_class(self, tree, file_path, report):
        try:
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    method_count = sum(1 for item in node.body if isinstance(item, ast.FunctionDef))
                    attr_count = sum(1 for item in node.body if isinstance(item, ast.Assign))
                    
                    if method_count > 4 or (method_count + attr_count) > 8:
                        report['GodClass'].append({
                            'file': file_path,
                            'lineStart': node.lineno,
                            'lineEnd': node.end_lineno or node.lineno,
                            'message': f"Class '{node.name}' has {method_count} methods and {attr_count} attributes.",
                            'snippet': ast.unparse(node) if hasattr(ast, 'unparse') else node.name
                        })
        except Exception as e:
            print(f"Error in detect_god_class for {file_path}: {e}", file=sys.stderr)

    def detect_large_parameter_list(self, tree, file_path, report):
        try:
            # Detect function definitions with many parameters
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    param_count = len(node.args.args)
                    # Don't count 'self' for methods
                    if node.args.args and node.args.args[0].arg == 'self':
                        param_count -= 1
                    
                    if param_count > 4:
                        report['LargeParameterList'].append({
                            'file': file_path,
                            'lineStart': node.lineno,
                            'lineEnd': node.end_lineno or node.lineno,
                            'message': f"Function '{node.name}' has {param_count} parameters.",
                            'snippet': ast.unparse(node) if hasattr(ast, 'unparse') else node.name
                        })
            
            # Detect function CALLS with many parameters
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    # Count positional arguments
                    pos_args = len(node.args) if node.args else 0
                    # Count keyword arguments  
                    kw_args = len(node.keywords) if node.keywords else 0
                    total_args = pos_args + kw_args
                    
                    if total_args > 6:  # Threshold for large call
                        # Try to get the function name
                        func_name = "unknown"
                        if isinstance(node.func, ast.Name):
                            func_name = node.func.id
                        elif isinstance(node.func, ast.Attribute):
                            func_name = node.func.attr
                        
                        report['LargeParameterList'].append({
                            'file': file_path,
                            'lineStart': node.lineno,
                            'lineEnd': node.lineno,
                            'message': f"Function call '{func_name}' has {total_args} arguments.",
                            'snippet': ast.unparse(node) if hasattr(ast, 'unparse') else str(total_args)
                        })
                        
        except Exception as e:
            print(f"Error in detect_large_parameter_list for {file_path}: {e}", file=sys.stderr)
        
    def detect_duplicated_code(self, code, file_path, report):
        """
        Detects both single-line and multi-line duplicated code blocks.
        Uses a sliding window (default: 2 lines) to find repeating patterns.
        """
        try:
            # Split code into lines and strip whitespace
            lines = [line.rstrip() for line in code.split('\n')]
            # Define how many consecutive lines make a "block" for comparison
            block_size = 1  # You can increase this (e.g., 3–5) for stricter detection

            # Store blocks and where they appear
            block_counts = {}
            block_positions = {}

            # --- STEP 1: Normalize code lines ---
            # Ignore empty lines or trivial boilerplate
            filtered_lines = []
            original_indices = []  # Keep track of line numbers in the original file

            for i, line in enumerate(lines, 1):
                stripped = line.strip()
                if (not stripped or
                    stripped.startswith('#') or
                    stripped.startswith('import ') or
                    stripped.startswith('from ') or
                    stripped.startswith('class ') or
                    stripped.startswith('@') or
                    'if __name__' in stripped):
                    continue
                filtered_lines.append(stripped)
                original_indices.append(i)

            # --- STEP 2: Build blocks of consecutive lines ---
            for i in range(len(filtered_lines) - block_size + 1):
                block = "\n".join(filtered_lines[i:i + block_size])
                if len(block) < 10:
                    continue

                if block not in block_counts:
                    block_counts[block] = 0
                    block_positions[block] = []

                block_counts[block] += 1
                block_positions[block].append(original_indices[i])

            # --- STEP 3: Report duplicated blocks ---
            for block, count in block_counts.items():
                if count > 1:
                    positions = block_positions[block]
                    report['DuplicatedCode'].append({
                        'file': file_path,
                        'lineStart': positions[0],
                        'lineEnd': positions[-1] + block_size - 1,
                        'message': f"Duplicate block appears {count} times at lines {positions}.",
                        'snippet': block
                    })

            # --- Debug info ---
            total_duplicates = sum(1 for c in block_counts.values() if c > 1)
            print(
                f"DEBUG: Found {len(block_counts)} unique blocks, {total_duplicates} duplicated blocks",
                file=sys.stderr
            )

        except Exception as e:
            print(f"Error in detect_duplicated_code for {file_path}: {e}", file=sys.stderr)


    def detect_magic_numbers(self, tree, file_path, report):
        try:
            allowed = {0, 1, -1, 2}  # Common numbers that are usually not magic
            for node in ast.walk(tree):
                if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                    if node.value not in allowed and abs(node.value) not in allowed:
                        report['MagicNumbers'].append({
                            'file': file_path,
                            'lineStart': node.lineno,
                            'lineEnd': node.lineno,
                            'message': f"Magic number {node.value} detected. Consider replacing with a named constant.",
                            'snippet': str(node.value)
                        })
                # Handle older Python versions with ast.Num
                elif isinstance(node, ast.Num) and node.n not in allowed and abs(node.n) not in allowed:
                    report['MagicNumbers'].append({
                        'file': file_path,
                        'lineStart': node.lineno,
                        'lineEnd': node.lineno,
                        'message': f"Magic number {node.n} detected. Consider replacing with a named constant.",
                        'snippet': str(node.n)
                    })
        except Exception as e:
            print(f"Error in detect_magic_numbers for {file_path}: {e}", file=sys.stderr)

    def detect_feature_envy(self, tree, file_path, report):
        try:
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    external_calls = Counter()
                    self_attributes = set()
                    
                    # Collect self attributes used
                    for subnode in ast.walk(node):
                        if isinstance(subnode, ast.Attribute) and isinstance(subnode.value, ast.Name) and subnode.value.id == 'self':
                            self_attributes.add(subnode.attr)
                    
                    # Count external method calls
                    for subnode in ast.walk(node):
                        if isinstance(subnode, ast.Call) and isinstance(subnode.func, ast.Attribute):
                            if isinstance(subnode.func.value, ast.Name) and subnode.func.value.id == 'self':
                                # This is a self method call
                                pass
                            else:
                                # External method call
                                external_calls[subnode.func.attr] += 1
                    
                    for method, count in external_calls.items():
                        if count > 2:  # Lowered threshold
                            report['FeatureEnvy'].append({
                                'file': file_path,
                                'lineStart': node.lineno,
                                'lineEnd': node.end_lineno or node.lineno,
                                'message': f"Function '{node.name}' calls external method '{method}' {count} times.",
                                'snippet': ast.unparse(node) if hasattr(ast, 'unparse') else node.name
                            })
        except Exception as e:
            print(f"Error in detect_feature_envy for {file_path}: {e}", file=sys.stderr)

    def analyze_file(self, file_path):
        report = {
            'LongMethod': [],
            'GodClass': [],
            'DuplicatedCode': [],
            'LargeParameterList': [],
            'MagicNumbers': [],
            'FeatureEnvy': []
        }
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
                tree = ast.parse(code)
                
                # Debug: Print enabled smells
                print(f"Enabled smells for {file_path}: {self.smells}", file=sys.stderr)
                
                for smell in self.smells:
                    if self.smells.get(smell, True):
                        method_name = f"detect_{self.camel_to_snake(smell)}"
                        print(f"Calling method: {method_name}", file=sys.stderr)
                        if hasattr(self, method_name):
                            if smell == "DuplicatedCode":
                                # Pass the actual code text (not AST tree)
                                getattr(self, method_name)(code, file_path, report)
                            else:
                                getattr(self, method_name)(tree, file_path, report)
                        else:
                            print(f"Method {method_name} not found!", file=sys.stderr)

                
            # Convert to count format
            for category in report:
                report[category] = {'count': len(report[category]), 'items': report[category]}
            
            # Debug: Print findings
            print(f"Findings for {file_path}: {report}", file=sys.stderr)
            
            return report
            
        except SyntaxError as e:
            print(f"Syntax error in {file_path}: {e}", file=sys.stderr)
            return {k: {'count': 0, 'items': []} for k in report}
        except Exception as e:
            print(f"Error processing {file_path}: {e}", file=sys.stderr)
            return {k: {'count': 0, 'items': []} for k in report}

if __name__ == "__main__":
    file_paths = sys.argv[1:-1]  # All but the last argument
    enabled_smells = json.loads(sys.argv[-1])  # Last argument is the JSON string of enabled smells
    detector = CodeSmellDetector(enabled_smells)
    all_findings = {}
    for file_path in file_paths:
        findings = detector.analyze_file(file_path)
        all_findings.update(findings)

    print(json.dumps(all_findings))