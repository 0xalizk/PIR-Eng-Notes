#!/usr/bin/env python3
"""
Master runner: generates all PIR visualization outputs.

Usage:
    cd data/
    uv run scripts/generate_all.py
"""

import sys
import os

# Ensure scripts directory is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from plot_toplevel import generate_all_toplevel
from plot_group_a import generate_group_a
from plot_group_b import generate_group_b
from plot_group_c import generate_group_c
from plot_group_d import generate_group_d
from plot_group_x import generate_group_x
from generate_tables import generate_all_tables
from generate_readmes import generate_readme


def main():
    print("=" * 60)
    print("PIR Visualization System — Generating All Outputs")
    print("=" * 60)
    print()

    # Generate plots (each returns {plot_id: (path, schemes)})
    toplevel_results = generate_all_toplevel()
    print()
    group_a_results = generate_group_a()
    print()
    group_b_results = generate_group_b()
    print()
    group_c_results = generate_group_c()
    print()
    group_d_results = generate_group_d()
    print()
    group_x_results = generate_group_x()
    print()
    generate_all_tables()

    # Generate READMEs for each output directory
    print()
    print("Generating READMEs...")
    generate_readme("top_level", toplevel_results)
    generate_readme("group_a", group_a_results)
    generate_readme("group_b", group_b_results)
    generate_readme("group_c", group_c_results)
    generate_readme("group_d", group_d_results)
    generate_readme("group_x", group_x_results)
    print("Done with READMEs.")

    print()
    print("=" * 60)
    print("All outputs generated successfully.")
    print("=" * 60)


if __name__ == "__main__":
    main()
